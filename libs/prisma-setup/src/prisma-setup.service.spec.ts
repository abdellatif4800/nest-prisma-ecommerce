import { Test, TestingModule } from '@nestjs/testing';
import { PrismaSetupService } from './prisma-setup.service';

describe('PrismaSetupService', () => {
  let service: PrismaSetupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaSetupService],
    }).compile();

    service = module.get<PrismaSetupService>(PrismaSetupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
