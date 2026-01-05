import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          // Use a factory or value to provide a fake version of the service
          useValue: {
            create: jest
              .fn()
              .mockImplementation((dto: CreateAuthDto) =>
                Promise.resolve({ id: 'uuid-123', ...dto }),
              ),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue({ id: '1' }),
            update: jest.fn().mockResolvedValue({ id: '1' }),
            remove: jest.fn().mockResolvedValue({ id: '1' }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  describe('create()', () => {
    it('should call authService.create and return the result', async () => {
      const dto: CreateAuthDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.create(dto);

      // Verify the service was called with the correct DTO
      expect(service.create).toHaveBeenCalledWith(dto);

      // Verify the result matches our mock implementation
      expect(result).toEqual({
        id: 'uuid-123',
        ...dto,
      });
    });
  });
});
