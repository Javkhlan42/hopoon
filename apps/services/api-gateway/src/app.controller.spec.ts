import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API info', () => {
      const result = appController.getRoot();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe('Hop-On API Gateway');
    });

    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.status).toBe('healthy');
    });
  });
});
