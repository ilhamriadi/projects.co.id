import database from '../config/database.js';

class Disaster {
    constructor() {
        this.db = database;
    }

    async create(disasterData) {
        const {
            reporter_id,
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
        } = disasterData;

        const query = `
            INSERT INTO disasters (
                reporter_id, kecamatan, desa, dusun, rt_rw, latitude, longitude,
                disaster_type, disaster_date, description, kk_affected, jiwa_affected,
                dead, injured, missing, evacuated, house_heavily_damaged,
                house_moderately_damaged, house_lightly_damaged, public_facilities, status
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            )
            RETURNING *
        `;

        try {
            const result = await this.db.query(query, [
                reporter_id,
                kecamatan,
                desa,
                dusun,
                rt_rw,
                latitude,
                longitude,
                disaster_type,
                disaster_date,
                description,
                kk_affected,
                jiwa_affected,
                dead,
                injured,
                missing,
                evacuated,
                house_heavily_damaged,
                house_moderately_damaged,
                house_lightly_damaged,
                JSON.stringify(public_facilities),
                status
            ]);

            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async findById(id, user = null) {
        let query = `
            SELECT d.*, u.full_name as reporter_name, u.role as reporter_role
            FROM disasters d
            JOIN users u ON d.reporter_id = u.id
            WHERE d.id = $1 AND d.is_deleted = false
        `;

        let queryParams = [id];

        // Add permission check if user is provided
        if (user && user.role !== 'bpbd') {
            if (user.role === 'kecamatan') {
                query += ' AND d.kecamatan = $2';
                queryParams.push(user.kecamatan);
            } else if (user.role === 'desa') {
                query += ' AND d.kecamatan = $2 AND d.desa = $3';
                queryParams.push(user.kecamatan, user.desa);
            }
        }

        try {
            const result = await this.db.query(query, queryParams);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    async findAll(filters = {}, user = null) {
        const {
            kecamatan,
            desa,
            disaster_type,
            status,
            start_date,
            end_date,
            search,
            page = 1,
            limit = 10,
            sort_by = 'reported_at',
            sort_order = 'DESC'
        } = filters;

        let whereConditions = ['d.is_deleted = false'];
        let queryParams = [];
        let paramIndex = 1;

        // Permission-based filtering
        if (user && user.role !== 'bpbd') {
            if (user.role === 'kecamatan') {
                whereConditions.push(`d.kecamatan = $${paramIndex++}`);
                queryParams.push(user.kecamatan);
            } else if (user.role === 'desa') {
                whereConditions.push(`d.kecamatan = $${paramIndex++} AND d.desa = $${paramIndex++}`);
                queryParams.push(user.kecamatan, user.desa);
            }
        }

        // Apply additional filters
        if (kecamatan) {
            whereConditions.push(`d.kecamatan = $${paramIndex++}`);
            queryParams.push(kecamatan);
        }

        if (desa) {
            whereConditions.push(`d.desa = $${paramIndex++}`);
            queryParams.push(desa);
        }

        if (disaster_type) {
            whereConditions.push(`d.disaster_type = $${paramIndex++}`);
            queryParams.push(disaster_type);
        }

        if (status) {
            whereConditions.push(`d.status = $${paramIndex++}`);
            queryParams.push(status);
        }

        if (start_date) {
            whereConditions.push(`d.disaster_date >= $${paramIndex++}`);
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push(`d.disaster_date <= $${paramIndex++}`);
            queryParams.push(end_date);
        }

        if (search) {
            whereConditions.push(`(
                d.description ILIKE $${paramIndex} OR
                d.kecamatan ILIKE $${paramIndex} OR
                d.desa ILIKE $${paramIndex} OR
                d.dusun ILIKE $${paramIndex} OR
                u.full_name ILIKE $${paramIndex}
            )`);
            queryParams.push(`%${search}%`);
            paramIndex++;
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
        const offset = (page - 1) * limit;

        // Validate sort_by to prevent SQL injection
        const validSortColumns = ['reported_at', 'disaster_date', 'kecamatan', 'desa', 'disaster_type', 'status'];
        const sortBy = validSortColumns.includes(sort_by) ? sort_by : 'reported_at';
        const sortOrder = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        const query = `
            SELECT
                d.*,
                u.full_name as reporter_name,
                u.role as reporter_role,
                uv.full_name as verified_by_name
            FROM disasters d
            JOIN users u ON d.reporter_id = u.id
            LEFT JOIN users uv ON d.verified_by = uv.id
            ${whereClause}
            ORDER BY d.${sortBy} ${sortOrder}
            LIMIT $${paramIndex++} OFFSET $${paramIndex}
        `;

        const countQuery = `
            SELECT COUNT(*) as total
            FROM disasters d
            JOIN users u ON d.reporter_id = u.id
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
                disasters: result.rows,
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

    async update(id, updateData, user = null) {
        // First check if user has permission to update this disaster
        const existing = await this.findById(id, user);
        if (!existing) {
            throw new Error('Disaster not found or access denied');
        }

        const allowedFields = [
            'description', 'kk_affected', 'jiwa_affected', 'dead', 'injured',
            'missing', 'evacuated', 'house_heavily_damaged', 'house_moderately_damaged',
            'house_lightly_damaged', 'public_facilities', 'latitude', 'longitude'
        ];

        // Build dynamic update query
        const updateFields = [];
        const updateValues = [];
        let paramIndex = 1;

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                updateFields.push(`${key} = $${paramIndex++}`);
                updateValues.push(key === 'public_facilities' ? JSON.stringify(value) : value);
            }
        }

        if (updateFields.length === 0) {
            throw new Error('No valid fields to update');
        }

        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        const query = `
            UPDATE disasters
            SET ${updateFields.join(', ')}
            WHERE id = $${paramIndex++} AND is_deleted = false
            RETURNING *
        `;

        try {
            const result = await this.db.query(query, [...updateValues, id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async updateStatus(id, status, verifiedBy = null, rejectionReason = null) {
        const query = `
            UPDATE disasters
            SET
                status = $1,
                verified_by = $2,
                verified_at = CASE WHEN $1 IN ('verified', 'rejected') THEN CURRENT_TIMESTAMP ELSE NULL END,
                rejection_reason = CASE WHEN $1 = 'rejected' THEN $3 ELSE NULL END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4 AND is_deleted = false
            RETURNING *
        `;

        try {
            const result = await this.db.query(query, [status, verifiedBy, rejectionReason, id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async softDelete(id, user = null) {
        // Check permission first
        const existing = await this.findById(id, user);
        if (!existing) {
            throw new Error('Disaster not found or access denied');
        }

        const query = `
            UPDATE disasters
            SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING id
        `;

        try {
            const result = await this.db.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async getStats(filters = {}, user = null) {
        const {
            kecamatan,
            desa,
            disaster_type,
            start_date,
            end_date
        } = filters;

        let whereConditions = ['d.is_deleted = false'];
        let queryParams = [];
        let paramIndex = 1;

        // Permission-based filtering
        if (user && user.role !== 'bpbd') {
            if (user.role === 'kecamatan') {
                whereConditions.push(`d.kecamatan = $${paramIndex++}`);
                queryParams.push(user.kecamatan);
            } else if (user.role === 'desa') {
                whereConditions.push(`d.kecamatan = $${paramIndex++} AND d.desa = $${paramIndex++}`);
                queryParams.push(user.kecamatan, user.desa);
            }
        }

        // Apply additional filters
        if (kecamatan) {
            whereConditions.push(`d.kecamatan = $${paramIndex++}`);
            queryParams.push(kecamatan);
        }

        if (desa) {
            whereConditions.push(`d.desa = $${paramIndex++}`);
            queryParams.push(desa);
        }

        if (disaster_type) {
            whereConditions.push(`d.disaster_type = $${paramIndex++}`);
            queryParams.push(disaster_type);
        }

        if (start_date) {
            whereConditions.push(`d.disaster_date >= $${paramIndex++}`);
            queryParams.push(start_date);
        }

        if (end_date) {
            whereConditions.push(`d.disaster_date <= $${paramIndex++}`);
            queryParams.push(end_date);
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        const query = `
            SELECT
                COUNT(*) as total_disasters,
                COUNT(CASE WHEN d.status = 'draft' THEN 1 END) as draft_disasters,
                COUNT(CASE WHEN d.status = 'submitted' THEN 1 END) as submitted_disasters,
                COUNT(CASE WHEN d.status = 'verified' THEN 1 END) as verified_disasters,
                COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as rejected_disasters,
                SUM(d.kk_affected) as total_kk_affected,
                SUM(d.jiwa_affected) as total_jiwa_affected,
                SUM(d.dead) as total_dead,
                SUM(d.injured) as total_injured,
                SUM(d.missing) as total_missing,
                SUM(d.evacuated) as total_evacuated,
                SUM(d.house_heavily_damaged) as total_house_heavily_damaged,
                SUM(d.house_moderately_damaged) as total_house_moderately_damaged,
                SUM(d.house_lightly_damaged) as total_house_lightly_damaged
            FROM disasters d
            ${whereClause}
        `;

        try {
            const result = await this.db.query(query, queryParams);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    async getDisasterTypes() {
        const query = `
            SELECT
                disaster_type,
                COUNT(*) as count,
                SUM(kk_affected) as total_kk_affected,
                SUM(jiwa_affected) as total_jiwa_affected
            FROM disasters
            WHERE is_deleted = false
            GROUP BY disaster_type
            ORDER BY count DESC
        `;

        try {
            const result = await this.db.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async getDisastersByMonth(year = null) {
        const currentYear = year || new Date().getFullYear();
        const query = `
            SELECT
                EXTRACT(MONTH FROM disaster_date) as month,
                COUNT(*) as count,
                SUM(kk_affected) as total_kk_affected,
                SUM(jiwa_affected) as total_jiwa_affected
            FROM disasters
            WHERE is_deleted = false
              AND EXTRACT(YEAR FROM disaster_date) = $1
            GROUP BY EXTRACT(MONTH FROM disaster_date)
            ORDER BY month
        `;

        try {
            const result = await this.db.query(query, [currentYear]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async getDisastersByArea(user = null) {
        let query = `
            SELECT
                kecamatan,
                desa,
                COUNT(*) as disaster_count,
                SUM(kk_affected) as total_kk_affected,
                SUM(jiwa_affected) as total_jiwa_affected
            FROM disasters
            WHERE is_deleted = false
        `;

        let queryParams = [];
        let paramIndex = 1;

        // Permission-based filtering
        if (user && user.role !== 'bpbd') {
            if (user.role === 'kecamatan') {
                query += ` AND kecamatan = $${paramIndex++}`;
                queryParams.push(user.kecamatan);
            } else if (user.role === 'desa') {
                query += ` AND kecamatan = $${paramIndex++} AND desa = $${paramIndex++}`;
                queryParams.push(user.kecamatan, user.desa);
            }
        }

        query += `
            GROUP BY kecamatan, desa
            ORDER BY kecamatan, desa
        `;

        try {
            const result = await this.db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    async searchByDescription(searchTerm, user = null) {
        let query = `
            SELECT
                d.*,
                u.full_name as reporter_name,
                u.role as reporter_role,
                ts_rank_cd(to_tsvector('indonesian', d.description), plainto_tsquery('indonesian', $1)) as rank
            FROM disasters d
            JOIN users u ON d.reporter_id = u.id
            WHERE d.is_deleted = false
              AND to_tsvector('indonesian', d.description) @@ plainto_tsquery('indonesian', $1)
        `;

        let queryParams = [searchTerm];

        // Permission-based filtering
        if (user && user.role !== 'bpbd') {
            if (user.role === 'kecamatan') {
                query += ` AND d.kecamatan = $2`;
                queryParams.push(user.kecamatan);
            } else if (user.role === 'desa') {
                query += ` AND d.kecamatan = $2 AND d.desa = $3`;
                queryParams.push(user.kecamatan, user.desa);
            }
        }

        query += ` ORDER BY rank DESC, d.reported_at DESC LIMIT 20`;

        try {
            const result = await this.db.query(query, queryParams);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

export default new Disaster();