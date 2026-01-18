import { Test, TestingModule } from '@nestjs/testing';
import { PaymentManagementService } from './payment-management.service';
import { log } from 'console';

const mockPaymentIntentsCreate = jest.fn();
jest.mock('stripe', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      paymentIntents: {
        create: mockPaymentIntentsCreate,
      },
    })),
  };
});

describe('PaymentManagementService', () => {
  let service: PaymentManagementService;

  beforeEach(async () => {
    mockPaymentIntentsCreate.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentManagementService,
        {
          provide: 'STRIPE_API_KEY',
          useValue: 'test_api_key',
        },
      ],
    })
      .setLogger({
        log: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        verbose: jest.fn(),
      })
      .compile();

    service = module.get<PaymentManagementService>(PaymentManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should successfully create and return a payment intent', async () => {
      // Arrange: Define what Stripe should return
      const amount = 2000;
      const currency = 'usd';
      const mockResponse = {
        id: 'pi_12345',
        amount,
        currency,
        status: 'requires_payment_method',
      };

      mockPaymentIntentsCreate.mockResolvedValue(mockResponse);

      // Act: Call the function
      const result = await service.createPaymentIntent(amount, currency);
      log(result);

      // Assert: Check if Stripe was called correctly and result matches
      expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
        amount,
        currency,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should log and re-throw error if Stripe API fails', async () => {
      // Arrange: Simulate a Stripe error
      const stripeError = new Error('Invalid API Key');
      mockPaymentIntentsCreate.mockRejectedValue(stripeError);

      // Act & Assert: Verify that the service throws the error up
      await expect(service.createPaymentIntent(100, 'eur')).rejects.toThrow(
        'Invalid API Key',
      );
    });
  });
});
