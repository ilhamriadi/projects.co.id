-- Database Schema for BPBD Sintang Disaster Reporting System
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication and role management
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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

-- Create index for users table
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kecamatan ON users(kecamatan);
CREATE INDEX idx_users_active ON users(is_active);

-- Disasters table for storing disaster reports
CREATE TABLE disasters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
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
    kk_affected INTEGER DEFAULT 0 CHECK (kk_affected >= 0),
    jiwa_affected INTEGER DEFAULT 0 CHECK (jiwa_affected >= 0),
    dead INTEGER DEFAULT 0 CHECK (dead >= 0),
    injured INTEGER DEFAULT 0 CHECK (injured >= 0),
    missing INTEGER DEFAULT 0 CHECK (missing >= 0),
    evacuated INTEGER DEFAULT 0 CHECK (evacuated >= 0),
    house_heavily_damaged INTEGER DEFAULT 0 CHECK (house_heavily_damaged >= 0),
    house_moderately_damaged INTEGER DEFAULT 0 CHECK (house_moderately_damaged >= 0),
    house_lightly_damaged INTEGER DEFAULT 0 CHECK (house_lightly_damaged >= 0),
    public_facilities JSONB DEFAULT '[]',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'verified', 'rejected'
    )),
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    photos JSONB DEFAULT '[]',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT false
);

-- Create indexes for disasters table
CREATE INDEX idx_disasters_kecamatan ON disasters(kecamatan);
CREATE INDEX idx_disasters_desa ON disasters(desa);
CREATE INDEX idx_disasters_type ON disasters(disaster_type);
CREATE INDEX idx_disasters_status ON disasters(status);
CREATE INDEX idx_disasters_date ON disasters(disaster_date);
CREATE INDEX idx_disasters_reporter ON disasters(reporter_id);
CREATE INDEX idx_disasters_is_deleted ON disasters(is_deleted);

-- Disaster photos table for storing photo information
CREATE TABLE disaster_photos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    disaster_id UUID NOT NULL REFERENCES disasters(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for disaster_photos
CREATE INDEX idx_disaster_photos_disaster_id ON disaster_photos(disaster_id);

-- Activity logs table for tracking all user actions
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for activity_logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_table_record ON activity_logs(table_name, record_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Notifications table for user notifications
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN (
        'info', 'success', 'warning', 'error'
    )),
    related_record_id UUID,
    related_table VARCHAR(100),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE disaster_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can only see their own profile or others if they are BPBD
CREATE POLICY "Users can view own profile or all if BPBD" ON users
    FOR SELECT USING (
        auth.uid() = id OR
        (SELECT role FROM users WHERE id = auth.uid()) = 'bpbd'
    );

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- BPBD can insert new users
CREATE POLICY "BPBD can insert users" ON users
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'bpbd'
    );

-- Desa users can only see their own disasters
CREATE POLICY "Desa users can view own disasters" ON disasters
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'desa' AND
        reporter_id = auth.uid()
    );

-- Kecamatan users can see disasters from their kecamatan
CREATE POLICY "Kecamatan users can view kecamatan disasters" ON disasters
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'kecamatan' AND
        kecamatan = (SELECT kecamatan FROM users WHERE id = auth.uid())
    );

-- BPBD users can see all disasters
CREATE POLICY "BPBD users can view all disasters" ON disasters
    FOR SELECT USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'bpbd'
    );

-- Users can insert disasters (desa role only)
CREATE POLICY "Desa users can insert disasters" ON disasters
    FOR INSERT WITH CHECK (
        (SELECT role FROM users WHERE id = auth.uid()) = 'desa' AND
        reporter_id = auth.uid()
    );

-- Desa users can update only their draft disasters
CREATE POLICY "Desa users can update own draft disasters" ON disasters
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'desa' AND
        reporter_id = auth.uid() AND
        status = 'draft'
    );

-- Kecamatan users can verify/reject disasters
CREATE POLICY "Kecamatan users can verify disasters" ON disasters
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'kecamatan' AND
        kecamatan = (SELECT kecamatan FROM users WHERE id = auth.uid()) AND
        status = 'submitted'
    );

-- BPBD users can update any disaster
CREATE POLICY "BPBD users can update any disaster" ON disasters
    FOR UPDATE USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'bpbd'
    );

-- Users can view photos based on disaster access
CREATE POLICY "Users can view photos based on disaster access" ON disaster_photos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM disasters
            WHERE disasters.id = disaster_photos.disaster_id
            AND (
                (SELECT role FROM users WHERE id = auth.uid()) = 'bpbd' OR
                ((SELECT role FROM users WHERE id = auth.uid()) = 'desa' AND disasters.reporter_id = auth.uid()) OR
                ((SELECT role FROM users WHERE id = auth.uid()) = 'kecamatan' AND disasters.kecamatan = (SELECT kecamatan FROM users WHERE id = auth.uid()))
            )
        )
    );

-- Users can insert photos for their own disasters
CREATE POLICY "Users can insert photos for own disasters" ON disaster_photos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM disasters
            WHERE disasters.id = disaster_photos.disaster_id
            AND disasters.reporter_id = auth.uid()
        )
    );

-- Users can view their own activity logs
CREATE POLICY "Users can view own activity logs" ON activity_logs
    FOR SELECT USING (user_id = auth.uid());

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
    FOR INSERT WITH CHECK (true);

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- System can insert notifications
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disasters_updated_at BEFORE UPDATE ON disasters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log activities
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO activity_logs (user_id, action, table_name, record_id, details)
        VALUES (
            COALESCE(NEW.reporter_id, auth.uid()),
            'INSERT',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO activity_logs (user_id, action, table_name, record_id, details)
        VALUES (
            COALESCE(NEW.verified_by, auth.uid()),
            'UPDATE',
            TG_TABLE_NAME,
            NEW.id,
            json_build_object(
                'old', row_to_json(OLD),
                'new', row_to_json(NEW)
            )
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO activity_logs (user_id, action, table_name, record_id, details)
        VALUES (
            auth.uid(),
            'DELETE',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for activity logging
CREATE TRIGGER log_disasters_activity
    AFTER INSERT OR UPDATE OR DELETE ON disasters
    FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Create trigger for logging status changes to notifications
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify reporter when status changes
    IF NEW.status != OLD.status AND OLD.status IS NOT NULL THEN
        INSERT INTO notifications (user_id, title, message, type, related_record_id, related_table)
        VALUES (
            NEW.reporter_id,
            'Status Laporan Diperbarui',
            CASE
                WHEN NEW.status = 'verified' THEN
                    'Laporan Anda telah diverifikasi oleh Kecamatan.'
                WHEN NEW.status = 'rejected' THEN
                    'Laporan Anda ditolak. Alasan: ' || COALESCE(NEW.rejection_reason, 'Tidak ada alasan.')
                ELSE 'Status laporan Anda telah diperbarui.'
            END,
            CASE
                WHEN NEW.status = 'verified' THEN 'success'
                WHEN NEW.status = 'rejected' THEN 'error'
                ELSE 'info'
            END,
            NEW.id,
            'disasters'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_disaster_status_change
    AFTER UPDATE OF status ON disasters
    FOR EACH ROW EXECUTE FUNCTION notify_status_change();