# Database migration helper script (Windows)

$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "hopon" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }

Write-Host "Running database migrations..." -ForegroundColor Green
Write-Host "Host: $DB_HOST:$DB_PORT"
Write-Host "Database: $DB_NAME"

# Run schema
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Schema applied successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Schema migration failed" -ForegroundColor Red
    exit 1
}

# Run seeds (only in dev)
if ($env:NODE_ENV -ne "production") {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seeds/dev-seed.sql
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Development seed data loaded" -ForegroundColor Green
    }
}

Write-Host "✓ Database setup complete!" -ForegroundColor Green
