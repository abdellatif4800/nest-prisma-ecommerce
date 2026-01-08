import { Test, TestingModule } from '@nestjs/testing';
import { OrderManagementController } from './order-management.controller';
import { OrderManagementService } from './order-management.service';

describe('OrderManagementController', () => {
  let controller: OrderManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderManagementController],
      providers: [OrderManagementService],
    }).compile();

    controller = module.get<OrderManagementController>(OrderManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
