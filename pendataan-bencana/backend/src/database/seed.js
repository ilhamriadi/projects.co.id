import pg from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

class DatabaseSeeder {
    constructor() {
        this.pool = null;
    }

    async connect() {
        try {
            const databaseUrl = process.env.DATABASE_URL;

            if (!databaseUrl) {
                throw new Error('DATABASE_URL environment variable is required');
            }

            this.pool = new pg.Pool({
                connectionString: databaseUrl,
                ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
            });

            const client = await this.pool.connect();
            await client.query('SELECT NOW()');
            client.release();

            console.log('✅ Database connected for seeding');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async seedUsers() {
        try {
            console.log('🔄 Seeding users...');

            const client = await this.pool.connect();

            try {
                await client.query('BEGIN');

                // Clear existing users
                await client.query('DELETE FROM users');

                // Hash passwords
                const passwordHash = await bcrypt.hash('password123', 10);

                // Sample users
                const users = [
                    {
                        id: uuidv4(),
                        email: 'bpbd@bencana.go.id',
                        password_hash: passwordHash,
                        full_name: 'Admin BPBD',
                        role: 'bpbd',
                        kecamatan: null,
                        desa: null,
                        phone: '081234567890'
                    },
                    {
                        id: uuidv4(),
                        email: 'kecamatan-ciputat@bencana.go.id',
                        password_hash: passwordHash,
                        full_name: 'Kepala Kecamatan Ciputat',
                        role: 'kecamatan',
                        kecamatan: 'Ciputat',
                        desa: null,
                        phone: '081234567891'
                    },
                    {
                        id: uuidv4(),
                        email: 'desa-ciputat@bencana.go.id',
                        password_hash: passwordHash,
                        full_name: 'Kepala Desa Ciputat',
                        role: 'desa',
                        kecamatan: 'Ciputat',
                        desa: 'Ciputat',
                        phone: '081234567892'
                    },
                    {
                        id: uuidv4(),
                        email: 'kecamatan-pamulang@bencana.go.id',
                        password_hash: passwordHash,
                        full_name: 'Kepala Kecamatan Pamulang',
                        role: 'kecamatan',
                        kecamatan: 'Pamulang',
                        desa: null,
                        phone: '081234567893'
                    },
                    {
                        id: uuidv4(),
                        email: 'desa-pamulang@bencana.go.id',
                        password_hash: passwordHash,
                        full_name: 'Kepala Desa Pamulang',
                        role: 'desa',
                        kecamatan: 'Pamulang',
                        desa: 'Pamulang',
                        phone: '081234567894'
                    }
                ];

                // Insert users
                const insertQuery = `
                    INSERT INTO users (id, email, password_hash, full_name, role, kecamatan, desa, phone)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                `;

                for (const user of users) {
                    await client.query(insertQuery, [
                        user.id,
                        user.email,
                        user.password_hash,
                        user.full_name,
                        user.role,
                        user.kecamatan,
                        user.desa,
                        user.phone
                    ]);
                }

                await client.query('COMMIT');
                console.log(`✅ ${users.length} users seeded successfully`);

                return users;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Failed to seed users:', error.message);
            throw error;
        }
    }

    async seedDisasters(users) {
        try {
            console.log('🔄 Seeding disasters...');

            const client = await this.pool.connect();

            try {
                await client.query('BEGIN');

                // Clear existing disasters
                await client.query('DELETE FROM disasters');
                await client.query('DELETE FROM activity_logs');
                await client.query('DELETE FROM notifications');

                const sampleDisasters = [
                    {
                        id: uuidv4(),
                        reporter_id: users.find(u => u.role === 'desa').id,
                        kecamatan: 'Ciputat',
                        desa: 'Ciputat',
                        dusun: 'Dusun I',
                        rt_rw: 'RT 001/RW 002',
                        latitude: -6.2740,
                        longitude: 106.7361,
                        disaster_type: 'banjir',
                        disaster_date: new Date('2024-01-15'),
                        description: 'Banjir yang disebabkan oleh hujan deras selama 3 hari. Air mencapai ketinggian 50-100 cm di pemukiman warga.',
                        kk_affected: 45,
                        jiwa_affected: 150,
                        dead: 0,
                        injured: 2,
                        missing: 0,
                        evacuated: 80,
                        house_heavily_damaged: 5,
                        house_moderately_damaged: 12,
                        house_lightly_damaged: 28,
                        public_facilities: {
                            sekolah: { rusak_berat: 1, rusak_sedang: 0, rusak_ringan: 2 },
                            masjid: { rusak_berat: 0, rusak_sedang: 1, rusak_ringan: 3 },
                            jalan: { rusak_berat: 0, rusak_sedang: 2, rusak_ringan: 5 }
                        },
                        status: 'verified',
                        verified_by: users.find(u => u.role === 'bpbd').id,
                        verified_at: new Date()
                    },
                    {
                        id: uuidv4(),
                        reporter_id: users.find(u => u.role === 'desa' && u.desa === 'Pamulang').id,
                        kecamatan: 'Pamulang',
                        desa: 'Pamulang',
                        dusun: 'Dusun III',
                        rt_rw: 'RT 005/RW 003',
                        latitude: -6.3400,
                        longitude: 106.7400,
                        disaster_type: 'angin_puting_beliung',
                        disaster_date: new Date('2024-02-20'),
                        description: 'Angin puting beliung melanda kawasan pemukiman, menyebabkan kerusakan pada atap rumah dan pohon tumbang.',
                        kk_affected: 12,
                        jiwa_affected: 35,
                        dead: 0,
                        injured: 1,
                        missing: 0,
                        evacuated: 0,
                        house_heavily_damaged: 3,
                        house_moderately_damaged: 4,
                        house_lightly_damaged: 5,
                        public_facilities: {
                            sekolah: { rusak_berat: 0, rusak_sedang: 1, rusak_ringan: 0 },
                            jembatan: { rusak_berat: 0, rusak_sedang: 0, rusak_ringan: 1 }
                        },
                        status: 'submitted'
                    },
                    {
                        id: uuidv4(),
                        reporter_id: users.find(u => u.role === 'kecamatan').id,
                        kecamatan: 'Ciputat',
                        desa: 'Ciputat',
                        dusun: 'Dusun II',
                        rt_rw: 'RT 003/RW 001',
                        latitude: -6.2750,
                        longitude: 106.7370,
                        disaster_type: 'longsor',
                        disaster_date: new Date('2024-03-10'),
                        description: 'Longsor kecil di area perbukitan, mengancam 2 rumah di bagian bawah.',
                        kk_affected: 8,
                        jiwa_affected: 25,
                        dead: 0,
                        injured: 0,
                        missing: 0,
                        evacuated: 15,
                        house_heavily_damaged: 0,
                        house_moderately_damaged: 2,
                        house_lightly_damaged: 1,
                        public_facilities: {
                            jalan: { rusak_berat: 0, rusak_sedang: 1, rusak_ringan: 0 }
                        },
                        status: 'draft'
                    }
                ];

                // Insert disasters
                const insertQuery = `
                    INSERT INTO disasters (
                        id, reporter_id, kecamatan, desa, dusun, rt_rw, latitude, longitude,
                        disaster_type, disaster_date, description, kk_affected, jiwa_affected,
                        dead, injured, missing, evacuated, house_heavily_damaged,
                        house_moderately_damaged, house_lightly_damaged, public_facilities,
                        status, verified_by, verified_at
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                        $17, $18, $19, $20, $21, $22, $23, $24
                    )
                `;

                for (const disaster of sampleDisasters) {
                    await client.query(insertQuery, [
                        disaster.id,
                        disaster.reporter_id,
                        disaster.kecamatan,
                        disaster.desa,
                        disaster.dusun,
                        disaster.rt_rw,
                        disaster.latitude,
                        disaster.longitude,
                        disaster.disaster_type,
                        disaster.disaster_date,
                        disaster.description,
                        disaster.kk_affected,
                        disaster.jiwa_affected,
                        disaster.dead,
                        disaster.injured,
                        disaster.missing,
                        disaster.evacuated,
                        disaster.house_heavily_damaged,
                        disaster.house_moderately_damaged,
                        disaster.house_lightly_damaged,
                        JSON.stringify(disaster.public_facilities),
                        disaster.status,
                        disaster.verified_by,
                        disaster.verified_at
                    ]);
                }

                // Create activity logs
                const logs = [
                    {
                        id: uuidv4(),
                        user_id: users.find(u => u.role === 'desa').id,
                        action: 'CREATE_DISASTER',
                        table_name: 'disasters',
                        record_id: sampleDisasters[0].id,
                        details: { disaster_type: 'banjir', kecamatan: 'Ciputat' },
                        ip_address: '192.168.1.100'
                    },
                    {
                        id: uuidv4(),
                        user_id: users.find(u => u.role === 'bpbd').id,
                        action: 'VERIFY_DISASTER',
                        table_name: 'disasters',
                        record_id: sampleDisasters[0].id,
                        details: { status: 'verified' },
                        ip_address: '192.168.1.101'
                    }
                ];

                const insertLogQuery = `
                    INSERT INTO activity_logs (id, user_id, action, table_name, record_id, details, ip_address)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                `;

                for (const log of logs) {
                    await client.query(insertLogQuery, [
                        log.id,
                        log.user_id,
                        log.action,
                        log.table_name,
                        log.record_id,
                        JSON.stringify(log.details),
                        log.ip_address
                    ]);
                }

                // Create notifications
                const notifications = [
                    {
                        id: uuidv4(),
                        user_id: users.find(u => u.role === 'kecamatan').id,
                        title: 'Laporan Baru - Banjir',
                        message: 'Laporan bencana banjir baru telah dibuat di Desa Ciputat',
                        type: 'info'
                    },
                    {
                        id: uuidv4(),
                        user_id: users.find(u => u.role === 'desa').id,
                        title: 'Laporan Terverifikasi',
                        message: 'Laporan bencana banjir Anda telah diverifikasi oleh BPBD',
                        type: 'success'
                    }
                ];

                const insertNotifQuery = `
                    INSERT INTO notifications (id, user_id, title, message, type)
                    VALUES ($1, $2, $3, $4, $5)
                `;

                for (const notif of notifications) {
                    await client.query(insertNotifQuery, [
                        notif.id,
                        notif.user_id,
                        notif.title,
                        notif.message,
                        notif.type
                    ]);
                }

                await client.query('COMMIT');
                console.log(`✅ ${sampleDisasters.length} disasters, ${logs.length} logs, ${notifications.length} notifications seeded successfully`);

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('❌ Failed to seed disasters:', error.message);
            throw error;
        }
    }

    async run() {
        try {
            await this.connect();
            const users = await this.seedUsers();
            await this.seedDisasters(users);
            console.log('✅ All seed data created successfully');
        } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            throw error;
        } finally {
            if (this.pool) {
                await this.pool.end();
            }
        }
    }
}

// Run seed if this file is executed directly
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    const seeder = new DatabaseSeeder();
    seeder.run().catch((error) => {
        console.error('❌ Seeding process failed:', error.message);
        process.exit(1);
    });
}

export default DatabaseSeeder;