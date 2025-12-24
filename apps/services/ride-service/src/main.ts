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
    .setTitle('Hop-On Ride Service')
    .setDescription(
      'Ride Management and Search Service\n\n' +
        '## Features\n' +
        '- Create ride offers (drivers only)\n' +
        '- Search rides by route and location (PostGIS)\n' +
        '- List available rides with filters\n' +
        '- Update ride details\n' +
        '- Start/Complete rides\n' +
        '- Ride feed for social discovery\n' +
        '- Comments on rides\n\n' +
        '## Ride Status\n' +
        '- `draft` - Not yet published\n' +
        '- `active` - Available for booking\n' +
        '- `full` - All seats booked\n' +
        '- `in_progress` - Ride started\n' +
        '- `completed` - Ride finished\n' +
        '- `cancelled` - Ride cancelled\n\n' +
        '## Location-Based Search\n' +
        'Uses PostgreSQL PostGIS for accurate distance calculations and route matching.',
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
    .addTag('Rides', 'Ride CRUD operations and management')
    .addTag('Admin - Rides', 'Admin ride management endpoints')
    .addServer('http://localhost:3003', 'Ride Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Ride Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`🚗 Ride Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
