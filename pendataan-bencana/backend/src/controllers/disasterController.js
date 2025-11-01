import Disaster from '../models/Disaster.js';
import { v4 as uuidv4 } from 'uuid';

class DisasterController {
    // Create new disaster report
    async createDisaster(req, res) {
        try {
            const {
                kecamatan,
                desa,
                dusun,
                rt_rw,
                latitude,
                longitude,
                disaster_type,
                disaster_date,
                description,
                kk_affected = 0,
                jiwa_affected = 0,
                dead = 0,
                injured = 0,
                missing = 0,
                evacuated = 0,
                house_heavily_damaged = 0,
                house_moderately_damaged = 0,
                house_lightly_damaged = 0,
                public_facilities = {},
                status = 'draft'
            } = req.body;

            // Validate required fields
            const requiredFields = ['kecamatan', 'desa', 'disaster_type', 'disaster_date'];
            const missingFields = requiredFields.filter(field => !req.body[field]);

            if (missingFields.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Required fields missing: ${missingFields.join(', ')}`,
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validate disaster type
            const validDisasterTypes = [
                'banjir', 'longsor', 'kebakaran', 'angin_puting_beliung',
                'gempa', 'kekeringan', 'lainnya'
            ];

            if (!validDisasterTypes.includes(disaster_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid disaster type',
                    code: 'INVALID_DISASTER_TYPE',
                    valid_types: validDisasterTypes
                });
            }

            // Validate numeric fields
            const numericFields = [
                'kk_affected', 'jiwa_affected', 'dead', 'injured', 'missing',
                'evacuated', 'house_heavily_damaged', 'house_moderately_damaged',
                'house_lightly_damaged'
            ];

            for (const field of numericFields) {
                const value = req.body[field];
                if (value !== undefined && (isNaN(value) || value < 0)) {
                    return res.status(400).json({
                        success: false,
                        message: `${field} must be a non-negative number`,
                        code: 'INVALID_NUMERIC_VALUE'
                    });
                }
            }

            // Validate coordinates
            if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude value',
                    code: 'INVALID_COORDINATES'
                });
            }

            if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid longitude value',
                    code: 'INVALID_COORDINATES'
                });
            }

            // Validate date
            const disasterDate = new Date(disaster_date);
            if (isNaN(disasterDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid disaster date',
                    code: 'INVALID_DATE'
                });
            }

            // Check user permissions for area
            if (req.user.role === 'desa') {
                if (req.user.kecamatan !== kecamatan || req.user.desa !== desa) {
                    return res.status(403).json({
                        success: false,
                        message: 'Cannot create disaster report for other areas',
                        code: 'AREA_ACCESS_DENIED'
                    });
                }
            } else if (req.user.role === 'kecamatan') {
                if (req.user.kecamatan !== kecamatan) {
                    return res.status(403).json({
                        success: false,
                        message: 'Cannot create disaster report for other kecamatan',
                        code: 'AREA_ACCESS_DENIED'
                    });
                }
            }

            // Create disaster
            const disaster = await Disaster.create({
                reporter_id: req.userId,
                kecamatan: kecamatan.trim(),
                desa: desa.trim(),
                dusun: dusun?.trim(),
                rt_rw: rt_rw?.trim(),
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                disaster_type,
                disaster_date: disasterDate,
                description: description?.trim(),
                kk_affected: parseInt(kk_affected) || 0,
                jiwa_affected: parseInt(jiwa_affected) || 0,
                dead: parseInt(dead) || 0,
                injured: parseInt(injured) || 0,
                missing: parseInt(missing) || 0,
                evacuated: parseInt(evacuated) || 0,
                house_heavily_damaged: parseInt(house_heavily_damaged) || 0,
                house_moderately_damaged: parseInt(house_moderately_damaged) || 0,
                house_lightly_damaged: parseInt(house_lightly_damaged) || 0,
                public_facilities: typeof public_facilities === 'object' ? public_facilities : {},
                status
            });

            // Emit real-time notification if socket.io is available
            if (req.io) {
                req.io.emit('disaster_created', {
                    disaster,
                    user: req.user
                });
            }

            res.status(201).json({
                success: true,
                message: 'Disaster report created successfully',
                data: { disaster }
            });
        } catch (error) {
            console.error('Create disaster error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get all disasters with filters
    async getDisasters(req, res) {
        try {
            const filters = {
                kecamatan: req.query.kecamatan,
                desa: req.query.desa,
                disaster_type: req.query.disaster_type,
                status: req.query.status,
                start_date: req.query.start_date,
                end_date: req.query.end_date,
                search: req.query.search,
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sort_by: req.query.sort_by,
                sort_order: req.query.sort_order
            };

            // Validate pagination
            if (filters.page < 1 || filters.limit < 1 || filters.limit > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pagination parameters',
                    code: 'VALIDATION_ERROR'
                });
            }

            const result = await Disaster.findAll(filters, req.user);

            res.status(200).json({
                success: true,
                message: 'Disasters retrieved successfully',
                data: result
            });
        } catch (error) {
            console.error('Get disasters error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get single disaster by ID
    async getDisasterById(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Disaster ID is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            const disaster = await Disaster.findById(id, req.user);

            if (!disaster) {
                return res.status(404).json({
                    success: false,
                    message: 'Disaster not found',
                    code: 'DISASTER_NOT_FOUND'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Disaster retrieved successfully',
                data: { disaster }
            });
        } catch (error) {
            console.error('Get disaster error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Update disaster
    async updateDisaster(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Disaster ID is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            // Validate numeric fields
            const numericFields = [
                'kk_affected', 'jiwa_affected', 'dead', 'injured', 'missing',
                'evacuated', 'house_heavily_damaged', 'house_moderately_damaged',
                'house_lightly_damaged', 'latitude', 'longitude'
            ];

            for (const field of numericFields) {
                if (updateData[field] !== undefined) {
                    const value = parseFloat(updateData[field]);
                    if (isNaN(value) || value < 0) {
                        return res.status(400).json({
                            success: false,
                            message: `${field} must be a non-negative number`,
                            code: 'INVALID_NUMERIC_VALUE'
                        });
                    }
                    updateData[field] = value;
                }
            }

            // Validate coordinates
            if (updateData.latitude && (updateData.latitude < -90 || updateData.latitude > 90)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid latitude value',
                    code: 'INVALID_COORDINATES'
                });
            }

            if (updateData.longitude && (updateData.longitude < -180 || updateData.longitude > 180)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid longitude value',
                    code: 'INVALID_COORDINATES'
                });
            }

            const disaster = await Disaster.update(id, updateData, req.user);

            // Emit real-time notification
            if (req.io) {
                req.io.emit('disaster_updated', {
                    disaster,
                    updated_by: req.user
                });
            }

            res.status(200).json({
                success: true,
                message: 'Disaster updated successfully',
                data: { disaster }
            });
        } catch (error) {
            console.error('Update disaster error:', error);

            if (error.message === 'Disaster not found or access denied') {
                return res.status(404).json({
                    success: false,
                    message: 'Disaster not found or access denied',
                    code: 'DISASTER_NOT_FOUND'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Update disaster status (verify/reject)
    async updateDisasterStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, rejection_reason } = req.body;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Disaster ID is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            const validStatuses = ['draft', 'submitted', 'verified', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status',
                    code: 'INVALID_STATUS',
                    valid_statuses: validStatuses
                });
            }

            // Only BPBD can verify/reject
            if (['verified', 'rejected'].includes(status) && req.user.role !== 'bpbd') {
                return res.status(403).json({
                    success: false,
                    message: 'Only BPBD can verify or reject disaster reports',
                    code: 'INSUFFICIENT_PERMISSIONS'
                });
            }

            // If rejecting, rejection reason is required
            if (status === 'rejected' && !rejection_reason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required when rejecting a disaster report',
                    code: 'VALIDATION_ERROR'
                });
            }

            const disaster = await Disaster.updateStatus(
                id,
                status,
                req.user.role === 'bpbd' ? req.userId : null,
                rejection_reason
            );

            // Emit real-time notification
            if (req.io) {
                req.io.emit('disaster_status_updated', {
                    disaster,
                    status,
                    updated_by: req.user
                });
            }

            res.status(200).json({
                success: true,
                message: `Disaster ${status} successfully`,
                data: { disaster }
            });
        } catch (error) {
            console.error('Update disaster status error:', error);

            if (error.message === 'Disaster not found or access denied') {
                return res.status(404).json({
                    success: false,
                    message: 'Disaster not found or access denied',
                    code: 'DISASTER_NOT_FOUND'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Delete disaster (soft delete)
    async deleteDisaster(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Disaster ID is required',
                    code: 'VALIDATION_ERROR'
                });
            }

            await Disaster.softDelete(id, req.user);

            // Emit real-time notification
            if (req.io) {
                req.io.emit('disaster_deleted', {
                    disaster_id: id,
                    deleted_by: req.user
                });
            }

            res.status(200).json({
                success: true,
                message: 'Disaster deleted successfully'
            });
        } catch (error) {
            console.error('Delete disaster error:', error);

            if (error.message === 'Disaster not found or access denied') {
                return res.status(404).json({
                    success: false,
                    message: 'Disaster not found or access denied',
                    code: 'DISASTER_NOT_FOUND'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get disaster statistics
    async getDisasterStats(req, res) {
        try {
            const filters = {
                kecamatan: req.query.kecamatan,
                desa: req.query.desa,
                disaster_type: req.query.disaster_type,
                start_date: req.query.start_date,
                end_date: req.query.end_date
            };

            const stats = await Disaster.getStats(filters, req.user);

            res.status(200).json({
                success: true,
                message: 'Disaster statistics retrieved successfully',
                data: { stats }
            });
        } catch (error) {
            console.error('Get disaster stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get disaster types statistics
    async getDisasterTypes(req, res) {
        try {
            const disasterTypes = await Disaster.getDisasterTypes();

            res.status(200).json({
                success: true,
                message: 'Disaster types statistics retrieved successfully',
                data: { disaster_types: disasterTypes }
            });
        } catch (error) {
            console.error('Get disaster types error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get disasters by month
    async getDisastersByMonth(req, res) {
        try {
            const { year } = req.query;
            const disasterByMonth = await Disaster.getDisastersByMonth(year ? parseInt(year) : null);

            res.status(200).json({
                success: true,
                message: 'Disasters by month retrieved successfully',
                data: { disasters_by_month: disasterByMonth }
            });
        } catch (error) {
            console.error('Get disasters by month error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Get disasters by area
    async getDisastersByArea(req, res) {
        try {
            const disastersByArea = await Disaster.getDisastersByArea(req.user);

            res.status(200).json({
                success: true,
                message: 'Disasters by area retrieved successfully',
                data: { disasters_by_area: disastersByArea }
            });
        } catch (error) {
            console.error('Get disasters by area error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }

    // Search disasters by description
    async searchDisasters(req, res) {
        try {
            const { q: searchTerm } = req.query;

            if (!searchTerm || searchTerm.trim().length < 3) {
                return res.status(400).json({
                    success: false,
                    message: 'Search term must be at least 3 characters long',
                    code: 'VALIDATION_ERROR'
                });
            }

            const results = await Disaster.searchByDescription(searchTerm.trim(), req.user);

            res.status(200).json({
                success: true,
                message: 'Search results retrieved successfully',
                data: {
                    results,
                    count: results.length,
                    search_term: searchTerm.trim()
                }
            });
        } catch (error) {
            console.error('Search disasters error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }
}

export default new DisasterController();