import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hop-On Notification Service')
    .setDescription(
      'Push Notification and Alert Service\n\n' +
        '## Features\n' +
        '- Send notifications to users\n' +
        '- Bulk notifications\n' +
        '- Get user notifications\n' +
        '- Mark notifications as read\n' +
        '- Unread count\n\n' +
        '## Notification Types\n' +
        '- `booking_created` - New booking request\n' +
        '- `booking_approved` - Booking approved\n' +
        '- `booking_rejected` - Booking rejected\n' +
        '- `booking_cancelled` - Booking cancelled\n' +
        '- `ride_starting_soon` - Ride starts in 30 min\n' +
        '- `payment_received` - Payment successful\n' +
        '- `payment_failed` - Payment failed\n' +
        '- `ride_completed` - Ride completed\n' +
        '- `new_message` - New chat message',
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
    .addTag('Notifications', 'Notification management and delivery')
    .addServer('http://localhost:3007', 'Notification Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Notification Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`🔔 Notification Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
