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
    .setTitle('Hop-On Payment Service')
    .setDescription(
      'Payment and Wallet Management Service\n\n' +
        '## Features\n' +
        '- Process ride payments\n' +
        '- Refund payments\n' +
        '- Payment history\n' +
        '- Wallet balance management\n' +
        '- Top-up wallet\n\n' +
        '## Payment Methods\n' +
        '- `card` - Credit/Debit card\n' +
        '- `wallet` - Internal wallet\n' +
        '- `cash` - Cash payment\n' +
        '- `bank_transfer` - Bank transfer\n\n' +
        '## Payment Status\n' +
        '- `pending` - Payment initiated\n' +
        '- `processing` - Being processed\n' +
        '- `completed` - Successfully completed\n' +
        '- `failed` - Payment failed\n' +
        '- `refunded` - Payment refunded',
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
    .addTag('Payments', 'Payment processing and management')
    .addTag('Wallet', 'Wallet balance and top-up operations')
    .addServer('http://localhost:3005', 'Payment Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Payment Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3005;
  await app.listen(port);
  console.log(`💳 Payment Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
