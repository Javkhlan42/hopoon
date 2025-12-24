import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Log all incoming requests
  app.use((req, res, next) => {
    console.log(`[Gateway] ${req.method} ${req.url}`);
    next();
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3100',
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api/v1');

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Hop-On API Gateway')
    .setDescription(
      'Complete API documentation for Hop-On ride-sharing platform.\n\n' +
        '## Base URL\n' +
        '- Development: `http://localhost:3000/api/v1`\n\n' +
        '## Authentication\n' +
        'Most endpoints require Bearer token authentication. Get your token from `/auth/login` or `/auth/register`.\n\n' +
        '## Services\n' +
        '- **Auth Service** - User authentication and management (port 3001)\n' +
        '- **Ride Service** - Ride creation and search (port 3003)\n' +
        '- **Booking Service** - Passenger bookings (port 3004)\n' +
        '- **Payment Service** - Payments and wallet (port 3005)\n' +
        '- **Chat Service** - Messaging (port 3006)\n' +
        '- **Notification Service** - Push notifications (port 3007)\n\n' +
        '## Status Codes\n' +
        '- `200` - Success\n' +
        '- `201` - Created\n' +
        '- `400` - Bad Request\n' +
        '- `401` - Unauthorized\n' +
        '- `403` - Forbidden\n' +
        '- `404` - Not Found\n' +
        '- `500` - Internal Server Error',
    )
    .setVersion('1.0.0')
    .setContact('Hop-On Support', 'https://hopon.mn', 'dev@hopon.mn')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentication - Register, login, logout, token refresh')
    .addTag(
      'Users',
      'User Profile - Profile management, photo upload, identity verification',
    )
    .addTag('Rides', 'Ride Management - Create, search, update rides')
    .addTag(
      'Bookings',
      'Booking Management - Book rides, approve/reject bookings',
    )
    .addTag(
      'Payments',
      'Payment Processing - Ride payments, refunds, payment history',
    )
    .addTag('Wallet', 'Wallet Management - Balance, top-up wallet')
    .addTag(
      'Chat',
      'Chat & Messaging - Conversations, messages, real-time chat',
    )
    .addTag('Notifications', 'Notifications - Push notifications, alerts')
    .addTag('Admin', 'Admin Panel - Dashboard, user/ride management, reports')
    .addServer('http://localhost:3000', 'Development Server')
    .addServer('http://localhost:3000/api/v1', 'Development API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Hop-On API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🌐 API Gateway running on port ${port}`);
  console.log(`📡 Routes: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
}

bootstrap();
