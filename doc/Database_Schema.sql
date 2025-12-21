-- HopOn Database Schema
-- PostgreSQL 13+ with PostGIS 3.0+
-- Version: 1.0
-- Date: December 21, 2025

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('driver', 'passenger', 'both', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'banned', 'deleted');
CREATE TYPE verification_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE ride_status AS ENUM ('draft', 'active', 'full', 'in_progress', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('wallet', 'cash', 'card');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'payment', 'refund', 'tip', 'commission');
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE notification_type AS ENUM (
    'booking_request',
    'booking_approved',
    'booking_rejected',
    'booking_cancelled',
    'ride_starting',
    'ride_started',
    'ride_completed',
    'new_message',
    'driver_nearby',
    'payment_received',
    'verification_approved',
    'verification_rejected',
    'report_resolved',
    'system'
);
CREATE TYPE report_category AS ENUM (
    'inappropriate_behavior',
    'unsafe_driving',
    'harassment',
    'fraud',
    'other'
);
CREATE TYPE report_status AS ENUM ('pending_review', 'reviewing', 'resolved', 'dismissed');
CREATE TYPE sos_status AS ENUM ('active', 'resolved', 'false_alarm');
CREATE TYPE message_type AS ENUM ('text', 'image', 'location', 'system');

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    status user_status NOT NULL DEFAULT 'active',
    
    -- Profile
    bio TEXT,
    profile_photo_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20),
    
    -- Verification
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    id_photo_url TEXT,
    selfie_photo_url TEXT,
    verification_submitted_at TIMESTAMP WITH TIME ZONE,
    verification_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Rating & Trust
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    trust_score INTEGER DEFAULT 0,
    badges TEXT[], -- ['verified', 'trusted', 'super_trusted']
    
    -- Statistics
    total_rides_as_driver INTEGER DEFAULT 0,
    total_rides_as_passenger INTEGER DEFAULT 0,
    total_distance_km DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(12,2) DEFAULT 0,
    
    -- Security
    blocked_users UUID[], -- Array of blocked user IDs
    emergency_contacts JSONB, -- {phone: '+976...', name: '...', relation: '...'}
    
    -- Settings
    language VARCHAR(10) DEFAULT 'mn',
    notification_preferences JSONB DEFAULT '{"push": true, "sms": true, "email": false}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for users
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_verification_status ON users(verification_status);
CREATE INDEX idx_users_rating ON users(rating DESC);
CREATE INDEX idx_users_name_trgm ON users USING gin(name gin_trgm_ops);

-- ============================================================================
-- COMMUNITY CIRCLES TABLE
-- ============================================================================

CREATE TABLE community_circles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    circle_type VARCHAR(50) NOT NULL, -- 'company', 'university', 'ladies_only', 'custom'
    verification_domain VARCHAR(100), -- e.g., '@unitel.mn' for company verification
    
    -- Settings
    is_public BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    
    -- Metadata
    member_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_circles_type ON community_circles(circle_type);

-- ============================================================================
-- CIRCLE MEMBERSHIPS TABLE
-- ============================================================================

CREATE TABLE circle_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    circle_id UUID NOT NULL REFERENCES community_circles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'pending', 'removed'
    verification_data JSONB, -- Verification credentials
    
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(circle_id, user_id)
);

CREATE INDEX idx_circle_memberships_user ON circle_memberships(user_id);
CREATE INDEX idx_circle_memberships_circle ON circle_memberships(circle_id);

-- ============================================================================
-- RIDES TABLE
-- ============================================================================

CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Route Information (PostGIS)
    origin_point GEOMETRY(Point, 4326) NOT NULL,
    origin_address TEXT NOT NULL,
    destination_point GEOMETRY(Point, 4326) NOT NULL,
    destination_address TEXT NOT NULL,
    route_polyline GEOMETRY(LineString, 4326), -- Full route path
    
    -- Route Metadata
    distance_meters INTEGER,
    estimated_duration_seconds INTEGER,
    
    -- Schedule
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    
    -- Capacity & Pricing
    seats_total INTEGER NOT NULL CHECK (seats_total >= 1 AND seats_total <= 5),
    seats_available INTEGER NOT NULL CHECK (seats_available >= 0),
    cost_per_seat DECIMAL(10,2) NOT NULL CHECK (cost_per_seat >= 0),
    total_cost DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'MNT',
    
    -- Status
    status ride_status NOT NULL DEFAULT 'draft',
    
    -- Preferences
    smoking_allowed BOOLEAN DEFAULT false,
    pets_allowed BOOLEAN DEFAULT false,
    music_preference VARCHAR(50),
    max_two_passengers_back BOOLEAN DEFAULT false,
    
    -- Notes
    notes TEXT,
    
    -- Recurring Ride
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- {frequency: 'daily', days: [1,2,3,4,5], endDate: '...'}
    parent_ride_id UUID REFERENCES rides(id), -- For recurring instances
    
    -- Community
    circle_only BOOLEAN DEFAULT false,
    allowed_circles UUID[], -- Array of circle IDs
    
    -- Maps
    mini_map_url TEXT,
    
    -- Metadata
    view_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    booking_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Spatial indexes for PostGIS
CREATE INDEX idx_rides_origin_point ON rides USING gist(origin_point);
CREATE INDEX idx_rides_destination_point ON rides USING gist(destination_point);
CREATE INDEX idx_rides_route_polyline ON rides USING gist(route_polyline);

-- Regular indexes
CREATE INDEX idx_rides_driver ON rides(driver_id);
CREATE INDEX idx_rides_departure_time ON rides(departure_time);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_circle_only ON rides(circle_only);
CREATE INDEX idx_rides_created_at ON rides(created_at DESC);

-- Composite index for search optimization
CREATE INDEX idx_rides_active_search ON rides(status, departure_time, seats_available) 
    WHERE status = 'active' AND deleted_at IS NULL;

-- ============================================================================
-- BOOKINGS TABLE
-- ============================================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Booking Details
    seats_requested INTEGER NOT NULL CHECK (seats_requested >= 1),
    status booking_status NOT NULL DEFAULT 'pending',
    
    -- Pickup
    pickup_note TEXT,
    preferred_pickup_point GEOMETRY(Point, 4326),
    preferred_pickup_address TEXT,
    
    -- Payment
    payment_method payment_method DEFAULT 'wallet',
    total_cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MNT',
    payment_status transaction_status DEFAULT 'pending',
    
    -- Approval/Rejection
    driver_response_message TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    refund_amount DECIMAL(10,2),
    refund_status transaction_status,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_ride ON bookings(ride_id);
CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

-- ============================================================================
-- CHATS TABLE
-- ============================================================================

CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    
    participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Metadata
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_text TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ride_id, participant_1_id, participant_2_id)
);

CREATE INDEX idx_chats_ride ON chats(ride_id);
CREATE INDEX idx_chats_participant_1 ON chats(participant_1_id);
CREATE INDEX idx_chats_participant_2 ON chats(participant_2_id);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Message Content
    message_type message_type NOT NULL DEFAULT 'text',
    text TEXT,
    image_url TEXT,
    location_data GEOMETRY(Point, 4326),
    
    -- Read Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_messages_chat ON messages(chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_read ON messages(is_read) WHERE is_read = false;

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Content
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Data
    related_ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    related_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    data JSONB, -- Additional context data
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Delivery
    push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ============================================================================
-- RATINGS TABLE
-- ============================================================================

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    
    rater_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rated_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags TEXT[], -- ['punctual', 'friendly', 'safe_driver', 'clean_car', etc.]
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(ride_id, rater_id, rated_user_id)
);

CREATE INDEX idx_ratings_ride ON ratings(ride_id);
CREATE INDEX idx_ratings_rated_user ON ratings(rated_user_id, created_at DESC);
CREATE INDEX idx_ratings_rater ON ratings(rater_id);

-- ============================================================================
-- WALLETS TABLE
-- ============================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Balance
    balance DECIMAL(12,2) DEFAULT 0.00 CHECK (balance >= 0),
    pending_balance DECIMAL(12,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'MNT',
    
    -- Statistics
    total_deposits DECIMAL(12,2) DEFAULT 0.00,
    total_withdrawals DECIMAL(12,2) DEFAULT 0.00,
    total_earnings DECIMAL(12,2) DEFAULT 0.00,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parties
    from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Transaction Details
    type transaction_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    fee DECIMAL(12,2) DEFAULT 0.00,
    net_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'MNT',
    
    -- Status
    status transaction_status NOT NULL DEFAULT 'pending',
    
    -- Related Entities
    related_ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Payment Details
    payment_method payment_method,
    payment_reference VARCHAR(255), -- External payment gateway reference
    
    -- Description
    description TEXT,
    notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT
);

CREATE INDEX idx_transactions_from_user ON transactions(from_user_id, created_at DESC);
CREATE INDEX idx_transactions_to_user ON transactions(to_user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_ride ON transactions(related_ride_id);

-- ============================================================================
-- REPORTS TABLE
-- ============================================================================

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Reporter & Reported
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Report Details
    category report_category NOT NULL,
    description TEXT NOT NULL,
    evidence_urls TEXT[], -- Array of screenshot URLs
    
    -- Related Entities
    related_ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    related_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    
    -- Status & Resolution
    status report_status NOT NULL DEFAULT 'pending_review',
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5), -- 1=highest, 5=lowest
    
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin user
    reviewed_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    action_taken VARCHAR(100), -- 'warn_user', 'suspend_user', 'ban_user', 'no_action'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_ticket ON reports(ticket_number);

-- ============================================================================
-- SOS ALERTS TABLE
-- ============================================================================

CREATE TABLE sos_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User & Ride
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    
    -- Location
    location_point GEOMETRY(Point, 4326) NOT NULL,
    location_address TEXT,
    
    -- Alert Details
    reason VARCHAR(100),
    status sos_status NOT NULL DEFAULT 'active',
    
    -- Response
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin
    responded_at TIMESTAMP WITH TIME ZONE,
    response_notes TEXT,
    emergency_services_notified BOOLEAN DEFAULT false,
    
    -- Resolution
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sos_user ON sos_alerts(user_id);
CREATE INDEX idx_sos_ride ON sos_alerts(ride_id);
CREATE INDEX idx_sos_status ON sos_alerts(status);
CREATE INDEX idx_sos_created_at ON sos_alerts(created_at DESC);
CREATE INDEX idx_sos_location ON sos_alerts USING gist(location_point);

-- ============================================================================
-- LOCATION HISTORY TABLE (for live tracking)
-- ============================================================================

CREATE TABLE location_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Location Data
    location_point GEOMETRY(Point, 4326) NOT NULL,
    accuracy DECIMAL(8,2), -- meters
    speed DECIMAL(6,2), -- km/h
    heading DECIMAL(5,2), -- degrees 0-360
    
    -- Metadata
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Partitioning by ride_id recommended for large datasets
CREATE INDEX idx_location_history_ride ON location_history(ride_id, recorded_at DESC);
CREATE INDEX idx_location_history_user ON location_history(user_id, recorded_at DESC);
CREATE INDEX idx_location_history_location ON location_history USING gist(location_point);

-- ============================================================================
-- RIDE VIEWS TABLE (analytics)
-- ============================================================================

CREATE TABLE ride_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- View Details
    ip_address INET,
    user_agent TEXT,
    
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ride_views_ride ON ride_views(ride_id);
CREATE INDEX idx_ride_views_viewer ON ride_views(viewer_id);

-- ============================================================================
-- RIDE COMMENTS TABLE
-- ============================================================================

CREATE TABLE ride_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Comment
    text TEXT NOT NULL,
    
    -- Moderation
    is_hidden BOOLEAN DEFAULT false,
    hidden_by UUID REFERENCES users(id) ON DELETE SET NULL,
    hidden_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_ride_comments_ride ON ride_comments(ride_id, created_at DESC);
CREATE INDEX idx_ride_comments_user ON ride_comments(user_id);

-- ============================================================================
-- ADMIN ACTIONS LOG TABLE
-- ============================================================================

CREATE TABLE admin_actions_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Action Details
    action_type VARCHAR(100) NOT NULL, -- 'suspend_user', 'delete_ride', 'resolve_report', etc.
    entity_type VARCHAR(50), -- 'user', 'ride', 'booking', 'report'
    entity_id UUID,
    
    -- Details
    description TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions_log(admin_id, created_at DESC);
CREATE INDEX idx_admin_actions_type ON admin_actions_log(action_type);
CREATE INDEX idx_admin_actions_entity ON admin_actions_log(entity_type, entity_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rides_updated_at BEFORE UPDATE ON rides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_circles_updated_at BEFORE UPDATE ON community_circles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ride_comments_updated_at BEFORE UPDATE ON ride_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user rating when new rating is added
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM ratings
            WHERE rated_user_id = NEW.rated_user_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM ratings
            WHERE rated_user_id = NEW.rated_user_id
        )
    WHERE id = NEW.rated_user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_rating AFTER INSERT ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Function to update ride seats_available when booking is approved/cancelled
CREATE OR REPLACE FUNCTION update_ride_seats()
RETURNS TRIGGER AS $$
BEGIN
    -- When booking is approved
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        UPDATE rides
        SET seats_available = seats_available - NEW.seats_requested,
            status = CASE 
                WHEN seats_available - NEW.seats_requested = 0 THEN 'full'::ride_status
                ELSE status
            END
        WHERE id = NEW.ride_id;
    END IF;
    
    -- When booking is cancelled after being approved
    IF NEW.status = 'cancelled' AND OLD.status = 'approved' THEN
        UPDATE rides
        SET seats_available = seats_available + NEW.seats_requested,
            status = CASE 
                WHEN status = 'full'::ride_status THEN 'active'::ride_status
                ELSE status
            END
        WHERE id = NEW.ride_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ride_seats AFTER UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_ride_seats();

-- Function to update chat last_message
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET 
        last_message_at = NEW.created_at,
        last_message_text = NEW.text
    WHERE id = NEW.chat_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_last_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- ============================================================================
-- FUNCTIONS FOR GEOSPATIAL QUERIES
-- ============================================================================

-- Function to find matching rides for a passenger's route
CREATE OR REPLACE FUNCTION find_matching_rides(
    p_origin_lat DECIMAL,
    p_origin_lng DECIMAL,
    p_dest_lat DECIMAL,
    p_dest_lng DECIMAL,
    p_max_distance_meters INTEGER DEFAULT 2000,
    p_departure_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    ride_id UUID,
    driver_id UUID,
    origin_address TEXT,
    destination_address TEXT,
    departure_time TIMESTAMP WITH TIME ZONE,
    seats_available INTEGER,
    cost_per_seat DECIMAL,
    match_score DECIMAL,
    pickup_distance_meters DECIMAL,
    dropoff_distance_meters DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS ride_id,
        r.driver_id,
        r.origin_address,
        r.destination_address,
        r.departure_time,
        r.seats_available,
        r.cost_per_seat,
        -- Calculate match score (0-1) based on proximity
        (1.0 - (
            (ST_Distance(r.route_polyline, ST_SetSRID(ST_MakePoint(p_origin_lng, p_origin_lat), 4326)::geography) + 
             ST_Distance(r.route_polyline, ST_SetSRID(ST_MakePoint(p_dest_lng, p_dest_lat), 4326)::geography)
            ) / (p_max_distance_meters * 2)
        ))::DECIMAL(3,2) AS match_score,
        ST_Distance(
            r.route_polyline, 
            ST_SetSRID(ST_MakePoint(p_origin_lng, p_origin_lat), 4326)::geography
        )::DECIMAL AS pickup_distance_meters,
        ST_Distance(
            r.route_polyline, 
            ST_SetSRID(ST_MakePoint(p_dest_lng, p_dest_lat), 4326)::geography
        )::DECIMAL AS dropoff_distance_meters
    FROM rides r
    WHERE 
        r.status = 'active'
        AND r.seats_available > 0
        AND r.deleted_at IS NULL
        -- Origin is within buffer distance of route
        AND ST_DWithin(
            r.route_polyline,
            ST_SetSRID(ST_MakePoint(p_origin_lng, p_origin_lat), 4326)::geography,
            p_max_distance_meters
        )
        -- Destination is within buffer distance of route
        AND ST_DWithin(
            r.route_polyline,
            ST_SetSRID(ST_MakePoint(p_dest_lng, p_dest_lat), 4326)::geography,
            p_max_distance_meters
        )
        -- Optional: Filter by departure date
        AND (p_departure_date IS NULL OR DATE(r.departure_time) = DATE(p_departure_date))
    ORDER BY match_score DESC, r.departure_time ASC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Function to get rides within radius (for feed)
CREATE OR REPLACE FUNCTION get_rides_near_location(
    p_lat DECIMAL,
    p_lng DECIMAL,
    p_radius_meters INTEGER DEFAULT 50000
)
RETURNS TABLE (
    ride_id UUID,
    distance_meters DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id AS ride_id,
        ST_Distance(
            r.origin_point,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography
        )::DECIMAL AS distance_meters
    FROM rides r
    WHERE 
        r.status = 'active'
        AND r.deleted_at IS NULL
        AND ST_DWithin(
            r.origin_point,
            ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
            p_radius_meters
        )
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active rides with driver info
CREATE VIEW v_active_rides AS
SELECT 
    r.id,
    r.driver_id,
    u.name AS driver_name,
    u.rating AS driver_rating,
    u.verification_status AS driver_verified,
    u.profile_photo_url AS driver_photo,
    r.origin_address,
    r.destination_address,
    ST_AsText(r.origin_point) AS origin_point_text,
    ST_AsText(r.destination_point) AS destination_point_text,
    r.departure_time,
    r.seats_available,
    r.cost_per_seat,
    r.currency,
    r.status,
    r.notes,
    r.mini_map_url,
    r.comment_count,
    r.created_at
FROM rides r
INNER JOIN users u ON r.driver_id = u.id
WHERE r.status = 'active' 
    AND r.deleted_at IS NULL
    AND u.status = 'active';

-- View for user statistics
CREATE VIEW v_user_stats AS
SELECT 
    u.id,
    u.name,
    u.rating,
    u.review_count,
    u.verification_status,
    u.total_rides_as_driver,
    u.total_rides_as_passenger,
    w.balance AS wallet_balance,
    (SELECT COUNT(*) FROM bookings WHERE passenger_id = u.id AND status = 'approved') AS upcoming_rides_as_passenger,
    (SELECT COUNT(*) FROM rides WHERE driver_id = u.id AND status IN ('active', 'full')) AS active_rides_as_driver
FROM users u
LEFT JOIN wallets w ON u.id = w.user_id
WHERE u.status = 'active';

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Create default admin user (password should be hashed in application)
INSERT INTO users (
    id,
    phone,
    email,
    name,
    role,
    status,
    verification_status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '+976-ADMIN',
    'admin@hopon.mn',
    'System Administrator',
    'admin',
    'active',
    'verified'
);

-- Create wallet for admin
INSERT INTO wallets (user_id) VALUES ('00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts (drivers, passengers, admins)';
COMMENT ON TABLE rides IS 'Ride posts with geospatial route information';
COMMENT ON TABLE bookings IS 'Passenger booking requests for rides';
COMMENT ON TABLE chats IS 'Chat conversations between users';
COMMENT ON TABLE messages IS 'Individual chat messages';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE ratings IS 'User ratings and reviews after rides';
COMMENT ON TABLE wallets IS 'User wallet balances';
COMMENT ON TABLE transactions IS 'Financial transactions';
COMMENT ON TABLE reports IS 'User reports and complaints';
COMMENT ON TABLE sos_alerts IS 'Emergency SOS alerts';
COMMENT ON TABLE location_history IS 'GPS tracking history during active rides';
COMMENT ON TABLE community_circles IS 'Verified community groups';
COMMENT ON TABLE circle_memberships IS 'User memberships in community circles';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
