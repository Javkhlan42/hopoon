#!/bin/bash
# Database migration helper script

set -e

DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-hopon}
DB_USER=${DB_USER:-postgres}

echo "Running database migrations..."
echo "Host: $DB_HOST:$DB_PORT"
echo "Database: $DB_NAME"

# Run schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

echo "✓ Schema applied successfully"

# Run seeds (only in dev)
if [ "$NODE_ENV" != "production" ]; then
  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seeds/dev-seed.sql
  echo "✓ Development seed data loaded"
fi

echo "✓ Database setup complete!"
