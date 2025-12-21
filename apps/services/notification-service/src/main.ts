import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3006);
  console.log(`Notification Service running on: ${await app.getUrl()}`);
}
bootstrap();
