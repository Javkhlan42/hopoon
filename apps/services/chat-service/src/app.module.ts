import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConversationsController } from './conversations/conversations.controller';
import { MessagesController } from './messages/messages.controller';
import { ConversationsService } from './conversations/conversations.service';
import { MessagesService } from './messages/messages.service';
import { ChatGateway } from './chat/chat.gateway';
import { Conversation } from './conversations/conversation.entity';
import { Message } from './messages/message.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hopon',
      entities: [Conversation, Message],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Conversation, Message]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
  ],
  controllers: [ConversationsController, MessagesController],
  providers: [
    ConversationsService,
    MessagesService,
    ChatGateway,
    JwtStrategy,
  ],
})
export class AppModule {}
