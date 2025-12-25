# Docker Setup - Hop-On Platform

Энэ хавтас нь Hop-On платформыг Docker ашиглан ажиллуулах бүх шаардлагатай файлуудыг агуулна.

## Файлын бүтэц

```
infra/docker/
├── docker-compose.yml          # Бүх сервисүүдийн тохиргоо
├── .dockerignore              # Docker build-с зайлсхийх файлууд
├── .env.example               # Environment хувьсагчдын жишээ
├── README.md                  # Энэ файл
├── hop-on.Dockerfile          # Passenger веб апп
├── admin-web.Dockerfile       # Админ веб апп
├── api-gateway.Dockerfile     # API Gateway сервис
├── auth-service.Dockerfile    # Authentication сервис
├── booking-service.Dockerfile # Booking сервис
├── ride-service.Dockerfile    # Ride сервис
├── payment-service.Dockerfile # Payment сервис
├── notification-service.Dockerfile # Notification сервис
└── chat-service.Dockerfile    # Chat сервис
```

## Эхлэх

### 1. Environment файл үүсгэх

```powershell
cd infra/docker
Copy-Item .env.example .env
```

`.env` файлыг засч, өөрийн тохиргоог оруулна уу:
- Database credentials
- JWT secret
- API keys (Google Maps, Stripe)
- SMTP тохиргоо

### 2. Docker images build хийх

**Нэг сервисийг build хийх:**
```powershell
docker-compose -f infra/docker/docker-compose.yml build hop-on
```

**Бүх сервисүүдийг build хийх:**
```powershell
docker-compose -f infra/docker/docker-compose.yml build
```

### 3. Сервисүүдийг ажиллуулах

**Бүх сервисүүдийг эхлүүлэх:**
```powershell
docker-compose -f infra/docker/docker-compose.yml up -d
```

**Нэг сервисийг эхлүүлэх:**
```powershell
docker-compose -f infra/docker/docker-compose.yml up -d hop-on
```

### 4. Logs харах

**Бүх сервисүүдийн logs:**
```powershell
docker-compose -f infra/docker/docker-compose.yml logs -f
```

**Тодорхой сервисийн logs:**
```powershell
docker-compose -f infra/docker/docker-compose.yml logs -f hop-on
```

### 5. Сервисүүдийг зогсоох

**Бүх сервисүүдийг зогсоох:**
```powershell
docker-compose -f infra/docker/docker-compose.yml down
```

**Volumes-тай хамт устгах:**
```powershell
docker-compose -f infra/docker/docker-compose.yml down -v
```

## Сервисүүд ба Портууд

| Сервис | Port | URL |
|--------|------|-----|
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Hop-On Web | 3002 | http://localhost:3002 |
| Booking Service | 3003 | http://localhost:3003 |
| Ride Service | 3004 | http://localhost:3004 |
| Payment Service | 3005 | http://localhost:3005 |
| Notification Service | 3006 | http://localhost:3006 |
| Chat Service | 3007 | http://localhost:3007 |
| Admin Web | 3010 | http://localhost:3010 |

## Health Checks

Бүх сервисүүд health check-тэй:
- Backend сервисүүд: `/health` endpoint
- Frontend apps: HTTP response check
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`

## Resource Limits

Сервис бүр CPU болон memory limit-тэй:
- PostgreSQL: 1 CPU, 1GB RAM
- Redis: 0.5 CPU, 512MB RAM
- Backend services: 0.5 CPU, 512MB RAM
- Frontend apps: 0.5 CPU, 512MB RAM

## Logs

Logs автоматаар rotate хийгдэнэ:
- Хамгийн их файлын хэмжээ: 10MB
- Хамгийн их файлын тоо: 3

## Troubleshooting

### Package-lock.json алдаа

Хэрэв package-lock.json corrupted бол:
```powershell
Remove-Item package-lock.json -Force
npm install --legacy-peer-deps
```

### Docker daemon холбогдохгүй байвал

1. Docker Desktop-г дахин эхлүүлэх
2. Docker service-г restart хийх:
```powershell
Restart-Service -Name com.docker.service -Force
```

### Build алдаа

Cache цэвэрлэж дахин build хийх:
```powershell
docker-compose -f infra/docker/docker-compose.yml build --no-cache hop-on
```

### Container logs шалгах

```powershell
# Тодорхой сервисийн logs
docker logs hopon-hop-on

# Real-time logs
docker logs -f hopon-hop-on

# Сүүлийн 100 мөр
docker logs --tail 100 hopon-hop-on
```

### Database холбогдохгүй байвал

1. PostgreSQL container ажиллаж байгаа эсэхийг шалгах:
```powershell
docker ps | Select-String postgres
```

2. Health status шалгах:
```powershell
docker inspect hopon-postgres | Select-String Health
```

3. Database logs харах:
```powershell
docker logs hopon-postgres
```

## Production Notes

Production орчинд deploy хийхээс өмнө:
- [ ] `.env` файлд бүх нууц утгуудыг солих
- [ ] JWT_SECRET-г өөрчлөх
- [ ] Database credentials-г secure хийх
- [ ] API keys нэмэх
- [ ] HTTPS тохируулах
- [ ] Firewall дүрмүүд тохируулах
- [ ] Backup стратеги бэлдэх

## Multi-stage Build Давуу тал

Бүх Dockerfile-ууд multi-stage build ашигладаг:
1. **deps**: Production dependencies татах
2. **builder-deps**: Build dependencies татах
3. **builder**: Application build хийх
4. **runner**: Production-ready container

Энэ нь:
- Image-ийн хэмжээг багасгадаг
- Build cache-г сайжруулдаг
- Security-г нэмэгдүүлдэг (dev dependencies байхгүй)

## Security Features

- Non-root хэрэглэгчээр ажилладаг
- dumb-init ашигласан signal handling
- Read-only volumes
- Resource limits
- Health checks
- Proper logging
