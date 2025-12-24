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
    .setTitle('Hop-On Chat Service')
    .setDescription(
      'Real-time Chat and Messaging Service\n\n' +
        '## Features\n' +
        '### REST API\n' +
        '- Create/manage conversations\n' +
        '- Send messages\n' +
        '- Get conversation messages\n' +
        '- Mark messages as read\n' +
        '- Unread count\n\n' +
        '### WebSocket (Socket.IO)\n' +
        '- Real-time messaging\n' +
        '- Typing indicators\n' +
        '- Join conversation/ride rooms\n' +
        '- Live notifications\n\n' +
        '## WebSocket Events\n' +
        '- `authenticate` - Authenticate user\n' +
        '- `join_conversation` - Join conversation room\n' +
        '- `join_ride` - Join ride room\n' +
        '- `send_message` - Send message\n' +
        '- `typing` - Typing indicator\n' +
        '- `mark_read` - Mark as read\n\n' +
        '**Note:** WebSocket connects directly to port 3006, not via API Gateway',
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
    .addTag('Conversations', 'Conversation management')
    .addTag('Messages', 'Message CRUD operations')
    .addTag('WebSocket', 'Real-time Socket.IO events (documentation only)')
    .addServer('http://localhost:3006', 'Chat Service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Chat Service API',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3006;
  await app.listen(port);
  console.log(`💬 Chat Service running on port ${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
