-- Database Schema for Sistem Pendataan Terdampak Bencana
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (for development)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS disaster_photos CASCADE;
DROP TABLE IF EXISTS disasters CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('desa', 'kecamatan', 'bpbd')),
    kecamatan VARCHAR(100),
    desa VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create disasters table
CREATE TABLE disasters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kecamatan VARCHAR(100) NOT NULL,
    desa VARCHAR(100) NOT NULL,
    dusun VARCHAR(100),
    rt_rw VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    disaster_type VARCHAR(50) NOT NULL CHECK (disaster_type IN (
        'banjir', 'longsor', 'kebakaran', 'angin_puting_beliung',
        'gempa', 'kekeringan', 'lainnya'
    )),
    disaster_date TIMESTAMP WITH TIME ZONE NOT NULL,
    description TEXT,
    kk_affected INTEGER DEFAULT 0,
    jiwa_affected INTEGER DEFAULT 0,
    dead INTEGER DEFAULT 0,
    injured INTEGER DEFAULT 0,
    missing INTEGER DEFAULT 0,
    evacuated INTEGER DEFAULT 0,
    house_heavily_damaged INTEGER DEFAULT 0,
    house_moderately_damaged INTEGER DEFAULT 0,
    house_lightly_damaged INTEGER DEFAULT 0,
    public_facilities JSONB,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'verified', 'rejected')),
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    photos JSONB,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Create disaster_photos table
CREATE TABLE disaster_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    photo_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kecamatan ON users(kecamatan);
CREATE INDEX idx_users_desa ON users(desa);

-- Disasters indexes
CREATE INDEX idx_disasters_kecamatan ON disasters(kecamatan);
CREATE INDEX idx_disasters_desa ON disasters(desa);
CREATE INDEX idx_disasters_disaster_type ON disasters(disaster_type);
CREATE INDEX idx_disasters_status ON disasters(status);
CREATE INDEX idx_disasters_disaster_date ON disasters(disaster_date);
CREATE INDEX idx_disasters_reporter_id ON disasters(reporter_id);
CREATE INDEX idx_disasters_created_at ON disasters(reported_at);

-- Disaster photos indexes
CREATE INDEX idx_disaster_photos_disaster_id ON disaster_photos(disaster_id);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX idx_activity_logs_table_name ON activity_logs(table_name);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disasters_updated_at BEFORE UPDATE ON disasters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create views for easier querying
CREATE VIEW disaster_summary AS
SELECT
    d.id,
    d.kecamatan,
    d.desa,
    d.disaster_type,
    d.disaster_date,
    d.status,
    d.kk_affected,
    d.jiwa_affected,
    d.dead,
    d.injured,
    d.missing,
    d.evacuated,
    d.house_heavily_damaged,
    d.house_moderately_damaged,
    d.house_lightly_damaged,
    u.full_name as reporter_name,
    u.role as reporter_role,
    d.reported_at
FROM disasters d
JOIN users u ON d.reporter_id = u.id
WHERE d.is_deleted = false;

CREATE VIEW user_disaster_stats AS
SELECT
    u.id,
    u.full_name,
    u.role,
    u.kecamatan,
    u.desa,
    COUNT(d.id) as total_disasters,
    COUNT(CASE WHEN d.status = 'verified' THEN 1 END) as verified_disasters,
    COUNT(CASE WHEN d.status = 'submitted' THEN 1 END) as pending_disasters,
    COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as rejected_disasters
FROM users u
LEFT JOIN disasters d ON u.id = d.reporter_id AND d.is_deleted = false
GROUP BY u.id, u.full_name, u.role, u.kecamatan, u.desa;

-- Create function to check user permissions
CREATE OR REPLACE FUNCTION can_access_disaster(user_id_param UUID, disaster_kecamatan VARCHAR, disaster_desa VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(20);
    user_kecamatan VARCHAR(100);
    user_desa VARCHAR(100);
BEGIN
    -- Get user details
    SELECT role, kecamatan, desa INTO user_role, user_kecamatan, user_desa
    FROM users WHERE id = user_id_param;

    -- BPBD can access all disasters
    IF user_role = 'bpbd' THEN
        RETURN true;
    END IF;

    -- Kecamatan can access disasters in their kecamatan
    IF user_role = 'kecamatan' AND user_kecamatan = disaster_kecamatan THEN
        RETURN true;
    END IF;

    -- Desa can access disasters in their desa
    IF user_role = 'desa' AND user_kecamatan = disaster_kecamatan AND user_desa = disaster_desa THEN
        RETURN true;
    END IF;

    RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate disaster report number
CREATE OR REPLACE FUNCTION generate_disaster_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    month_part TEXT;
    sequence_num TEXT;
BEGIN
    year_part := EXTRACT(year FROM CURRENT_TIMESTAMP)::TEXT;
    month_part := LPAD(EXTRACT(month FROM CURRENT_TIMESTAMP)::TEXT, 2, '0');

    -- Get next sequence for this month/year
    SELECT LPAD(COUNT(*) + 1::TEXT, 4, '0')
    INTO sequence_num
    FROM disasters
    WHERE EXTRACT(year FROM reported_at) = EXTRACT(year FROM CURRENT_TIMESTAMP)
      AND EXTRACT(month FROM reported_at) = EXTRACT(month FROM CURRENT_TIMESTAMP);

    RETURN 'D' || year_part || month_part || sequence_num;
END;
$$ LANGUAGE plpgsql;