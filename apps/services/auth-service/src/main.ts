import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hop-On Auth Service')
    .setDescription(
      'Authentication and User Management Service\n\n' +
        '## Features\n' +
        '- User registration (driver/passenger)\n' +
        '- Login with phone & password\n' +
        '- JWT token-based authentication\n' +
        '- Token refresh\n' +
        '- Admin authentication\n' +
        '- User profile management\n' +
        '- Identity verification\n' +
        '- Admin dashboard & user management\n\n' +
        '## Roles\n' +
        '- `passenger` - Regular user who books rides\n' +
        '- `driver` - User who offers rides\n' +
        '- `admin` - Administrator with full access',
    )
    .setVersion('1.0.0')
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
    .addTag(
      'Auth',
      'Authentication - Register, login, logout, token management',
    )
    .addTag(
      'Users',
      'User Profile - Profile, photo upload, identity verification, reviews',
    )
    .addTag('Admin - Users', 'Admin user management endpoints')
    .addTag('Admin - Dashboard', 'Admin dashboard statistics and analytics')
    .addTag('Admin - SOS', 'Emergency SOS alert management')
    .addTag('Admin - Moderation', 'Content moderation and reports')
    .addTag('Admin - Reports', 'Reports and analytics')
    .addTag('Admin - System', 'System management and monitoring')
    .addServer('http://localhost:3001', 'Auth Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Auth Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Auth Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
