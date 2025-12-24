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
    .setDescription('API Gateway for Hop-On ride-sharing microservices')
    .setVersion('1.0')
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
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Rides', 'Ride management endpoints')
    .addTag('Bookings', 'Booking management endpoints')
    .addTag('Payments', 'Payment and wallet endpoints')
    .addTag('Chat', 'Real-time chat endpoints')
    .addTag('Notifications', 'Notification endpoints')
    .addServer('http://localhost:3000', 'Development Server')
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
