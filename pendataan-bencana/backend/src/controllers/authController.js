import jwt from 'jsonwebtoken';
import User from '../models/User.js';

class AuthController {
    // Generate JWT token
    generateToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    // Register new user
    async register(req, res) {
        try {
            const {
                email,
                password,
                full_name,
                role,
                kecamatan,
                desa,
                phone
            } = req.body;

            // Validate required fields
            if (!email || !password || !full_name || !role) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, password, full_name, and role are required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validate role
            const validRoles = ['desa', 'kecamatan', 'bpbd'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be one of: desa, kecamatan, bpbd',
                    code: 'INVALID_ROLE'
                });
            }

            // Validate role-specific fields
            if (role === 'desa' && (!kecamatan || !desa)) {
                return res.status(400).json({
                    success: false,
                    message: 'Kecamatan and desa are required for desa role',
                    code: 'VALIDATION_ERROR'
                });
            }

            if (role === 'kecamatan' && !kecamatan) {
                return res.status(400).json({
                    success: false,
                    message: 'Kecamatan is required for kecamatan role',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validate password strength
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format',
                    code: 'INVALID_EMAIL'
                });
            }

            // Create user
            const user = await User.create({
                email: email.toLowerCase().trim(),
                password,
                full_name: full_name.trim(),
                role,
                kecamatan: kecamatan?.trim() || null,
                desa: desa?.trim() || null,
                phone: phone?.trim() || null
            });

            // Generate token
            const token = this.generateToken(user.id);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        kecamatan: user.kecamatan,
                        desa: user.desa,
                        phone: user.phone,
                        is_active: user.is_active,
                        created_at: user.created_at
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);

            if (error.message === 'Email already exists') {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered',
                    code: 'EMAIL_EXISTS'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Find user by email
            const user = await User.findByEmail(email.toLowerCase().trim());
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Verify password
            const isPasswordValid = await User.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Generate token
            const token = this.generateToken(user.id);

            // Update last login (you might want to add last_login field to users table)
            await User.updateProfile(user.id, { last_login: new Date() });

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        kecamatan: user.kecamatan,
                        desa: user.desa,
                        phone: user.phone,
                        is_active: user.is_active
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = req.user;

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        full_name: user.full_name,
                        role: user.role,
                        kecamatan: user.kecamatan,
                        desa: user.desa,
                        phone: user.phone,
                        is_active: user.is_active,
                        created_at: user.created_at,
                        updated_at: user.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.userId;
            const {
                full_name,
                phone,
                kecamatan,
                desa
            } = req.body;

            const updateData = {};

            // Only update fields that are provided
            if (full_name !== undefined) {
                if (!full_name.trim()) {
                    return res.status(400).json({
                        success: false,
                        message: 'Full name cannot be empty',
                        code: 'VALIDATION_ERROR'
                    });
                }
                updateData.full_name = full_name.trim();
            }

            if (phone !== undefined) {
                updateData.phone = phone?.trim() || null;
            }

            // Only allow kecamatan/desa updates for BPBD users or within their role constraints
            if (req.user.role === 'bpbd') {
                if (kecamatan !== undefined) updateData.kecamatan = kecamatan?.trim() || null;
                if (desa !== undefined) updateData.desa = desa?.trim() || null;
            } else {
                // Non-BPBD users cannot change their kecamatan/desa through this endpoint
                if (kecamatan !== undefined || desa !== undefined) {
                    return res.status(403).json({
                        success: false,
                        message: 'Only BPBD users can change kecamatan/desa',
                        code: 'INSUFFICIENT_PERMISSIONS'
                    });
                }
            }

            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No fields to update',
                    code: 'VALIDATION_ERROR'
                });
            }

            const updatedUser = await User.updateProfile(userId, updateData);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        full_name: updatedUser.full_name,
                        role: updatedUser.role,
                        kecamatan: updatedUser.kecamatan,
                        desa: updatedUser.desa,
                        phone: updatedUser.phone,
                        updated_at: updatedUser.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Change password
    async changePassword(req, res) {
        try {
            const userId = req.userId;
            const { current_password, new_password } = req.body;

            // Validate required fields
            if (!current_password || !new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validate new password strength
            if (new_password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Get current user data
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await User.verifyPassword(current_password, user.password_hash);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect',
                    code: 'INVALID_CURRENT_PASSWORD'
                });
            }

            // Update password
            await User.updatePassword(userId, new_password);

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Refresh token
    async refreshToken(req, res) {
        try {
            const user = req.user;

            // Generate new token
            const token = this.generateToken(user.id);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token
                }
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Logout (client-side token removal)
    async logout(req, res) {
        try {
            // In a stateless JWT implementation, logout is typically handled client-side
            // by removing the token from storage. Here we just confirm success.

            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }
}

export default new AuthController();