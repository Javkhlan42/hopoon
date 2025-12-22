-- Seed data for development
-- password for all test users: "password123"

-- Insert test users (drivers, passengers, both)
INSERT INTO users
    (id, phone, email, password_hash, name, role, verification_status, rating)
VALUES
    ('11111111-1111-1111-1111-111111111111', '+97699123456', 'driver1@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Баярмаа', 'driver', 'verified', 4.8),
    ('22222222-2222-2222-2222-222222222222', '+97699123457', 'passenger1@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Болдбаатар', 'passenger', 'verified', 4.5),
    ('33333333-4444-4444-4444-444444444444', '+97699123458', 'driver2@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Сарнай', 'driver', 'verified', 4.9),
    ('44444444-5555-5555-5555-555555555555', '+97699123459', 'passenger2@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Ганбат', 'passenger', 'verified', 4.3),
    ('55555555-6666-6666-6666-666666666666', '+97699123460', 'both@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Энхжаргал', 'both', 'verified', 4.7),
    ('66666666-7777-7777-7777-777777777777', '+97699123461', 'driver3@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Төмөр', 'driver', 'pending', 4.2),
    ('77777777-8888-8888-8888-888888888888', '+97699123462', 'passenger3@test.com', '$2b$10$rqYvZ5kN7K.7K8K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K0K', 'Оюунаа', 'passenger', 'verified', 4.6);

-- Insert test rides (various routes and statuses)
INSERT INTO rides
    (id, driver_id, origin_lat, origin_lng, origin_address, destination_lat, destination_lng, destination_address, departure_time, available_seats, price_per_seat, status)
VALUES
    -- Active rides
    ('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
        47.918871, 106.917581, 'Сүхбаатарын талбай',
        47.873440, 106.761740, 'Чингисийн Өргөө Нисэх Буудал',
        NOW() + INTERVAL '2 hours', 3, 15000, 'active'),
    
    ('bbbbbbbb-2222-2222-2222-222222222222', '33333333-4444-4444-4444-444444444444',
        47.918871, 106.917581, 'Өргөө кино театр',
        47.913, 106.875, 'Зайсан толгой',
        NOW() + INTERVAL '4 hours', 2, 8000, 'active'),
    
    ('cccccccc-3333-3333-3333-333333333333', '55555555-6666-6666-6666-666666666666',
        47.918, 106.917, 'Их Сургууль',
        48.035, 106.255, 'Налайх',
        NOW() + INTERVAL '1 day', 4, 20000, 'active'),
    
    -- In progress ride
    ('dddddddd-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111',
        47.920, 106.915, 'State Department Store',
        47.880, 106.760, 'Нисэх буудал',
        NOW() - INTERVAL '30 minutes', 2, 15000, 'in_progress'),
    
    -- Completed rides
    ('eeeeeeee-5555-5555-5555-555555555555', '33333333-4444-4444-4444-444444444444',
        47.918, 106.917, 'Peace Avenue',
        47.900, 106.930, 'Grand Mall',
        NOW() - INTERVAL '5 hours', 3, 5000, 'completed'),
    
    -- Full ride
    ('ffffffff-6666-6666-6666-666666666666', '55555555-6666-6666-6666-666666666666',
        47.918, 106.917, 'Энхтайван өргөн чөлөө',
        48.400, 107.100, 'Тэрэлж',
        NOW() + INTERVAL '2 days', 4, 50000, 'full');

-- Insert test bookings (various statuses)
INSERT INTO bookings
    (id, ride_id, passenger_id, seats, status, price)
VALUES
    -- Approved bookings
    ('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222', 1, 'approved', 15000),
    
    ('22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-2222-2222-2222-222222222222',
        '44444444-5555-5555-5555-555555555555', 2, 'approved', 8000),
    
    ('33333333-cccc-cccc-cccc-cccccccccccc', 'cccccccc-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222', 1, 'approved', 20000),
    
    -- Pending booking
    ('44444444-dddd-dddd-dddd-dddddddddddd', 'cccccccc-3333-3333-3333-333333333333',
        '77777777-8888-8888-8888-888888888888', 2, 'pending', 20000),
    
    -- Completed bookings
    ('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-5555-5555-5555-555555555555',
        '22222222-2222-2222-2222-222222222222', 2, 'completed', 5000),
    
    -- Full ride bookings
    ('66666666-ffff-ffff-ffff-ffffffffffff', 'ffffffff-6666-6666-6666-666666666666',
        '22222222-2222-2222-2222-222222222222', 2, 'approved', 50000),
    
    ('77777777-1111-2222-3333-444444444445', 'ffffffff-6666-6666-6666-666666666666',
        '44444444-5555-5555-5555-555555555555', 2, 'approved', 50000);

-- Insert test wallets
INSERT INTO wallets
    (id, user_id, balance)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 150000),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 85000),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-4444-4444-4444-444444444444', 200000),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-5555-5555-5555-555555555555', 45000),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-6666-6666-6666-666666666666', 120000);

-- Insert test payments
INSERT INTO payments
    (id, booking_id, user_id, amount, method, type, status)
VALUES
    ('11111111-1111-2222-3333-444444444444', '11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        '22222222-2222-2222-2222-222222222222', 15000, 'wallet', 'ride', 'completed'),
    
    ('22222222-2222-3333-4444-555555555555', '22222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        '44444444-5555-5555-5555-555555555555', 16000, 'card', 'ride', 'completed'),
    
    ('33333333-3333-4444-5555-666666666666', '55555555-eeee-eeee-eeee-eeeeeeeeeeee',
        '22222222-2222-2222-2222-222222222222', 10000, 'wallet', 'ride', 'completed'),
    
    ('44444444-4444-5555-6666-777777777777', NULL,
        '22222222-2222-2222-2222-222222222222', 50000, 'card', 'wallet_topup', 'completed');

-- Insert test conversations
INSERT INTO conversations
    (id, type, participant_ids)
VALUES
    ('aaaaaaaa-cccc-cccc-cccc-cccccccccccc', 'direct',
        ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid]),
    
    ('bbbbbbbb-dddd-dddd-dddd-dddddddddddd', 'direct',
        ARRAY['33333333-4444-4444-4444-444444444444'::uuid, '44444444-5555-5555-5555-555555555555'::uuid]);

-- Insert test messages
INSERT INTO messages
    (id, conversation_id, sender_id, content, type, status)
VALUES
    ('11111111-1111-2222-3333-444444444446', 'aaaaaaaa-cccc-cccc-cccc-cccccccccccc',
        '22222222-2222-2222-2222-222222222222', 'Сайн уу, явахдаа биднийг авч болох уу?', 'text', 'read'),
    
    ('22222222-2222-3333-4444-555555555556', 'aaaaaaaa-cccc-cccc-cccc-cccccccccccc',
        '11111111-1111-1111-1111-111111111111', 'Мэдээжээ, хаана байна та?', 'text', 'read'),
    
    ('33333333-3333-4444-5555-666666666667', 'bbbbbbbb-dddd-dddd-dddd-dddddddddddd',
        '44444444-5555-5555-5555-555555555555', 'Захиалга баталгаажуулсан уу?', 'text', 'delivered');
