# Database Setup Guide

## Prerequisites

- PostgreSQL 13+ installed
- PostGIS extension available

## Setup Instructions

### Windows PowerShell

```powershell
# 1. Create database
psql -U postgres -c "CREATE DATABASE hopon;"

# 2. Run schema migration
psql -U postgres -d hopon -f infra/db/schema.sql

# 3. (Optional) Run dev seed data
psql -U postgres -d hopon -f infra/db/seeds/dev-seed.sql
```

### Linux/Mac

```bash
# Make migration script executable
chmod +x infra/db/migrate.sh

# Run migration
./infra/db/migrate.sh
```

## Verify Installation

```sql
-- Connect to database
psql -U postgres -d hopon

-- Check extensions
\dx

-- Check tables
\dt

-- Check PostGIS
SELECT PostGIS_version();
```

## Database Schema Overview

### Tables

- **users** - User accounts (drivers, passengers, admins)
- **rides** - Ride postings with geo-spatial data
- **bookings** - Ride bookings/reservations
- **wallets** - User wallet balances
- **payments** - Payment transactions
- **notifications** - Push/email/SMS notifications
- **conversations** - Chat conversations
- **messages** - Chat messages

### Extensions

- **uuid-ossp** - UUID generation
- **postgis** - Geo-spatial functionality
- **pg_trgm** - Text search optimization

## Connection String

```
postgresql://postgres:postgres@localhost:5432/hopon
```

Update `.env` files in each service:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hopon
```
