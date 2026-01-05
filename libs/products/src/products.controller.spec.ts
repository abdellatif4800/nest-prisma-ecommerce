import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn().mockResolvedValue({
              id: 'uuid-123',
              productName: 'Test Product',
              stock: 10,
              price: 99.99,
            }),
            findAll: jest.fn().mockResolvedValue([
              {
                id: 'uuid-123',
                productName: 'Test Product',
                stock: 10,
                price: 99.99,
              },
            ]),
            findOne: jest.fn().mockResolvedValue({
              id: 'uuid-123',
              productName: 'Test Product',
              stock: 10,
              price: 99.99,
            }),
            update: jest.fn().mockResolvedValue({
              id: 'uuid-123',
              productName: 'Updated Product',
              stock: 15,
              price: 149.99,
            }),
            remove: jest.fn().mockResolvedValue({
              id: 'uuid-123',
              productName: 'Test Product',
              stock: 10,
              price: 99.99,
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should call productsService.create and return the result', async () => {
      const dto: CreateProductDto = {
        productName: 'Test Product',
        stock: 10,
        price: 99.99,
        subCategoryId: 'sub-category-uuid',
      };

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({
        id: 'uuid-123',
        productName: 'Test Product',
        stock: 10,
        price: 99.99,
      });
    });
  });

  describe('findAll()', () => {
    it('should call productsService.findAll and return all products', async () => {
      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'uuid-123',
          productName: 'Test Product',
          stock: 10,
          price: 99.99,
        },
      ]);
    });
  });

  describe('findOne()', () => {
    it('should call productsService.findOne and return the product', async () => {
      const result = await controller.findOne('uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual({
        id: 'uuid-123',
        productName: 'Test Product',
        stock: 10,
        price: 99.99,
      });
    });

    it('should throw NotFoundException if product not found', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException('Product with ID not-found not found'),
        );

      await expect(controller.findOne('not-found')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should call productsService.update and return the updated product', async () => {
      const updateDto = { productName: 'Updated Product', stock: 15 };

      const result = await controller.update('uuid-123', updateDto);

      expect(service.update).toHaveBeenCalledWith('uuid-123', updateDto);
      expect(result).toEqual({
        id: 'uuid-123',
        productName: 'Updated Product',
        stock: 15,
        price: 149.99,
      });
    });
  });

  describe('remove()', () => {
    it('should call productsService.remove and return the deleted product', async () => {
      const result = await controller.remove('uuid-123');

      expect(service.remove).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual({
        id: 'uuid-123',
        productName: 'Test Product',
        stock: 10,
        price: 99.99,
      });
    });
  });
});
