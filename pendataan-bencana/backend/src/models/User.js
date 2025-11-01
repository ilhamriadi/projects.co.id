import database from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    constructor() {
        this.db = database;
    }

    async create(userData) {
        const {
            email,
            password,
            full_name,
            role,
            kecamatan,
            desa,
            phone
        } = userData;

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (email, password_hash, full_name, role, kecamatan, desa, phone)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, email, full_name, role, kecamatan, desa, phone, is_active, created_at
        `;

        try {
            const result = await this.db.query(query, [
                email.toLowerCase().trim(),
                password_hash,
                full_name.trim(),
                role,
                kecamatan,
                desa,
                phone
            ]);

            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    async findByEmail(email) {
        const query = `
            SELECT id, email, password_hash, full_name, role, kecamatan, desa, phone, is_active, created_at, updated_at
            FROM users
            WHERE email = $1 AND is_active = true
        `;

        try {
            const result = await this.db.query(query, [email.toLowerCase().trim()]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        const query = `
            SELECT id, email, full_name, role, kecamatan, desa, phone, is_active, created_at, updated_at
            FROM users
            WHERE id = $1 AND is_active = true
        `;

        try {
            const result = await this.db.query(query, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(id, newPassword) {
        const password_hash = await bcrypt.hash(newPassword, 10);
        const query = `
            UPDATE users
            SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2 AND is_active = true
            RETURNING id, email, full_name, role
        `;

        try {
            const result = await this.db.query(query, [password_hash, id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async updateProfile(id, updateData) {
        const {
            full_name,
            phone,
            kecamatan,
            desa
        } = updateData;

        const query = `
            UPDATE users
            SET full_name = $1, phone = $2, kecamatan = $3, desa = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5 AND is_active = true
            RETURNING id, email, full_name, role, kecamatan, desa, phone, updated_at
        `;

        try {
            const result = await this.db.query(query, [
                full_name?.trim(),
                phone,
                kecamatan,
                desa,
                id
            ]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    async findAll(filters = {}) {
        const {
            role,
            kecamatan,
            desa,
            search,
            page = 1,
            limit = 10
        } = filters;

        let whereConditions = ['is_active = true'];
        let queryParams = [];
        let paramIndex = 1;

        if (role) {
            whereConditions.push(`role = $${paramIndex++}`);
            queryParams.push(role);
        }

        if (kecamatan) {
            whereConditions.push(`kecamatan = $${paramIndex++}`);
            queryParams.push(kecamatan);
        }

        if (desa) {
            whereConditions.push(`desa = $${paramIndex++}`);
            queryParams.push(desa);
        }

        if (search) {
            whereConditions.push(`(
                full_name ILIKE $${paramIndex} OR
                email ILIKE $${paramIndex} OR
                phone ILIKE $${paramIndex}
            )`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
        const offset = (page - 1) * limit;

        const query = `
            SELECT
                id, email, full_name, role, kecamatan, desa, phone, is_active,
                created_at, updated_at
            FROM users
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT $${paramIndex++} OFFSET $${paramIndex}
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM users
            ${whereClause}
        `;

        try {
            const [result, countResult] = await Promise.all([
                this.db.query(query, [...queryParams, limit, offset]),
                this.db.query(countQuery, queryParams)
            ]);

            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);

            return {
                users: result.rows,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw error;
        }
    }

    async deactivate(id) {
        const query = `
            UPDATE users
            SET is_active = false, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id, email, full_name, role, is_active
        `;

        try {
            const result = await this.db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async getUsersByKecamatan(kecamatan) {
        const query = `
            SELECT id, email, full_name, role, desa, phone
            FROM users
            WHERE kecamatan = $1 AND is_active = true
            ORDER BY role, full_name
        `;

        try {
            const result = await this.db.query(query, [kecamatan]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async getUsersByRole(role) {
        const query = `
            SELECT id, email, full_name, kecamatan, desa, phone
            FROM users
            WHERE role = $1 AND is_active = true
            ORDER BY kecamatan, desa, full_name
        `;

        try {
            const result = await this.db.query(query, [role]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async getUsersByArea(kecamatan, desa = null) {
        let whereConditions = ['is_active = true'];
        let queryParams = [];
        let paramIndex = 1;

        if (kecamatan) {
            whereConditions.push(`kecamatan = $${paramIndex++}`);
            queryParams.push(kecamatan);
        }

        if (desa) {
            whereConditions.push(`desa = $${paramIndex++}`);
            queryParams.push(desa);
        }

        const whereClause = whereConditions.join(' AND ');

        const query = `
            SELECT id, email, full_name, role, kecamatan, desa, phone
            FROM users
            WHERE ${whereClause}
            ORDER BY role, full_name
        `;

        try {
            const result = await this.db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async getStats() {
        const query = `
            SELECT
                COUNT(*) as total_users,
                COUNT(CASE WHEN role = 'bpbd' THEN 1 END) as bpbd_users,
                COUNT(CASE WHEN role = 'kecamatan' THEN 1 END) as kecamatan_users,
                COUNT(CASE WHEN role = 'desa' THEN 1 END) as desa_users,
                COUNT(DISTINCT kecamatan) as total_kecamatan,
                COUNT(DISTINCT desa) as total_desa
            FROM users
            WHERE is_active = true
        `;

        try {
            const result = await this.db.query(query);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

export default new User();