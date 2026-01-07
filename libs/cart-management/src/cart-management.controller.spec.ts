import { Test, TestingModule } from '@nestjs/testing';
import { CartManagementController } from './cart-management.controller';
import { CartManagementService } from './cart-management.service';

describe('CartManagementController', () => {
  let controller: CartManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartManagementController],
      providers: [CartManagementService],
    }).compile();

    controller = module.get<CartManagementController>(CartManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
