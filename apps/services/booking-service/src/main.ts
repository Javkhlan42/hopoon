import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hop-On Booking Service')
    .setDescription(
      'Booking Management Service\n\n' +
        '## Features\n' +
        '- Create bookings (passengers)\n' +
        '- List user bookings\n' +
        '- Approve/Reject bookings (drivers)\n' +
        '- Cancel bookings\n' +
        '- Complete bookings\n' +
        '- Driver booking management\n\n' +
        '## Booking Status\n' +
        '- `pending` - Waiting for driver approval\n' +
        '- `approved` - Confirmed by driver\n' +
        '- `rejected` - Declined by driver\n' +
        '- `cancelled` - Cancelled by passenger\n' +
        '- `completed` - Ride completed',
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
    .addTag('Bookings', 'Booking CRUD and management')
    .addServer('http://localhost:3004', 'Booking Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Booking Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`📚 Booking Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
