-- HopOn Database Schema
-- PostgreSQL 13+ with PostGIS 3.0+

CREATE EXTENSION
IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION
IF NOT EXISTS "postgis";
CREATE EXTENSION
IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE user_role AS ENUM
('driver', 'passenger', 'both', 'admin');
CREATE TYPE verification_status AS ENUM
('unverified', 'pending', 'verified', 'rejected');
CREATE TYPE ride_status AS ENUM
('draft', 'active', 'full', 'in_progress', 'completed', 'cancelled');
CREATE TYPE booking_status AS ENUM
('pending', 'approved', 'rejected', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM
('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM
('ride', 'wallet_topup', 'refund');
CREATE TYPE payment_method AS ENUM
('card', 'wallet', 'cash');
CREATE TYPE notification_type AS ENUM
('ride_request', 'booking_approved', 'booking_rejected', 'booking_cancelled', 'ride_started', 'ride_completed', 'payment_received', 'payment_failed', 'message_received', 'system_alert');
CREATE TYPE notification_channel AS ENUM
('email', 'sms', 'push', 'in_app');
CREATE TYPE notification_status AS ENUM
('pending', 'sent', 'delivered', 'failed', 'read');
CREATE TYPE message_type AS ENUM
('text', 'image', 'file', 'location', 'system');
CREATE TYPE message_status AS ENUM
('sent', 'delivered', 'read', 'failed');
CREATE TYPE conversation_type AS ENUM
('direct', 'group');

-- Users table
CREATE TABLE users
(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'passenger',
    verification_status verification_status NOT NULL DEFAULT 'unverified',
    rating DECIMAL(3,2) DEFAULT 0.00,
    refresh_token TEXT,
    created_at TIMESTAMP
    WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
    WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

    -- Rides table
    CREATE TABLE rides
    (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        driver_id UUID NOT NULL REFERENCES users(id),
        origin_lat DECIMAL(10,8) NOT NULL,
        origin_lng DECIMAL(11,8) NOT NULL,
        origin_address TEXT NOT NULL,
        destination_lat DECIMAL(10,8) NOT NULL,
        destination_lng DECIMAL(11,8) NOT NULL,
        destination_address TEXT NOT NULL,
        route_geometry GEOMETRY(LINESTRING,
        4326),
    departure_time TIMESTAMP
        WITH TIME ZONE NOT NULL,
    available_seats INTEGER NOT NULL CHECK
        (available_seats >= 0),
    price_per_seat DECIMAL
        (10,2) NOT NULL,
    status ride_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP
        WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
        WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

        CREATE INDEX idx_rides_driver ON rides(driver_id);
        CREATE INDEX idx_rides_status ON rides(status);
        CREATE INDEX idx_rides_departure ON rides(departure_time);
        CREATE INDEX idx_rides_geometry ON rides USING GIST
        (route_geometry);

        -- Bookings table
        CREATE TABLE bookings
        (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            ride_id UUID NOT NULL REFERENCES rides(id),
            passenger_id UUID NOT NULL REFERENCES users(id),
            seats INTEGER NOT NULL DEFAULT 1,
            status booking_status NOT NULL DEFAULT 'pending',
            price DECIMAL(10,2) NOT NULL,
            created_at TIMESTAMP
            WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
            WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

            CREATE INDEX idx_bookings_ride ON bookings(ride_id);
            CREATE INDEX idx_bookings_passenger ON bookings(passenger_id);

            -- Wallets table
            CREATE TABLE wallets
            (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID UNIQUE NOT NULL REFERENCES users(id),
                balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                frozen_balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                currency VARCHAR(3) NOT NULL DEFAULT 'MNT',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at TIMESTAMP
                WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
                WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

                CREATE INDEX idx_wallets_user ON wallets(user_id);

                -- Payments table
                CREATE TABLE payments
                (
                    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                    user_id UUID NOT NULL REFERENCES users(id),
                    booking_id UUID REFERENCES bookings(id),
                    amount DECIMAL(10,2) NOT NULL,
                    type payment_type NOT NULL,
                    method payment_method NOT NULL,
                    status payment_status NOT NULL DEFAULT 'pending',
                    description TEXT,
                    metadata JSONB,
                    transaction_id TEXT,
                    failure_reason TEXT,
                    created_at TIMESTAMP
                    WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
                    WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

                    CREATE INDEX idx_payments_user ON payments(user_id);
                    CREATE INDEX idx_payments_booking ON payments(booking_id);
                    CREATE INDEX idx_payments_status ON payments(status);

                    -- Notifications table
                    CREATE TABLE notifications
                    (
                        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                        user_id UUID NOT NULL REFERENCES users(id),
                        type notification_type NOT NULL,
                        channel notification_channel NOT NULL,
                        status notification_status NOT NULL DEFAULT 'pending',
                        title VARCHAR(255) NOT NULL,
                        message TEXT NOT NULL,
                        data JSONB,
                        sent_at TIMESTAMP
                        WITH TIME ZONE,
    read_at TIMESTAMP
                        WITH TIME ZONE,
    failure_reason TEXT,
    created_at TIMESTAMP
                        WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
                        WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

                        CREATE INDEX idx_notifications_user ON notifications(user_id);
                        CREATE INDEX idx_notifications_status ON notifications(status);
                        CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

                        -- Conversations table
                        CREATE TABLE conversations
                        (
                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                            type conversation_type NOT NULL DEFAULT 'direct',
                            title VARCHAR(255),
                            participant_ids UUID
                            [] NOT NULL,
    booking_id UUID REFERENCES bookings
                            (id),
    ride_id UUID REFERENCES rides
                            (id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP
                            WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
                            WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

                            CREATE INDEX idx_conversations_participants ON conversations USING GIN
                            (participant_ids);
                            CREATE INDEX idx_conversations_booking ON conversations(booking_id);
                            CREATE INDEX idx_conversations_ride ON conversations(ride_id);

                            -- Messages table
                            CREATE TABLE messages
                            (
                                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                                sender_id UUID NOT NULL REFERENCES users(id),
                                type message_type NOT NULL DEFAULT 'text',
                                content TEXT NOT NULL,
                                status message_status NOT NULL DEFAULT 'sent',
                                metadata JSONB,
                                read_by UUID
                                [],
    delivered_at TIMESTAMP
                                WITH TIME ZONE,
    read_at TIMESTAMP
                                WITH TIME ZONE,
    created_at TIMESTAMP
                                WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
                                WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

                                CREATE INDEX idx_messages_conversation ON messages(conversation_id);
                                CREATE INDEX idx_messages_sender ON messages(sender_id);
                                CREATE INDEX idx_messages_created ON messages(created_at DESC);
