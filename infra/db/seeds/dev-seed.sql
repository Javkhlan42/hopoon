-- Seed data for development

-- Insert test users
INSERT INTO users
    (id, phone, email, name, role, verification_status, rating)
VALUES
    ('11111111-1111-1111-1111-111111111111', '+97699123456', 'driver@test.com', 'Test Driver', 'driver', 'verified', 4.8),
    ('22222222-2222-2222-2222-222222222222', '+97699123457', 'passenger@test.com', 'Test Passenger', 'passenger', 'verified', 4.5);

-- Insert test rides
INSERT INTO rides
    (id, driver_id, origin_lat, origin_lng, origin_address, destination_lat, destination_lng, destination_address, departure_time, available_seats, price_per_seat, status)
VALUES
    ('33333333-3333-3333-3333-333333333333',
        '11111111-1111-1111-1111-111111111111',
        47.918871, 106.917581, 'Ulaanbaatar Center',
        47.873440, 106.761740, 'Chinggis Khaan Airport',
        NOW() + INTERVAL
'2 hours',
   3,
   15000,
   'active');

-- Insert test booking
INSERT INTO bookings
    (id, ride_id, passenger_id, seats, status, price)
VALUES
    ('44444444-4444-4444-4444-444444444444',
        '33333333-3333-3333-3333-333333333333',
        '22222222-2222-2222-2222-222222222222',
        1,
        'approved',
        15000);
