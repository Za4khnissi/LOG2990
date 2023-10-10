import { Test, TestingModule } from '@nestjs/testing';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
    let service: ErrorHandlerService;
    let mockAction: () => Promise<string>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ErrorHandlerService],
        }).compile();

        service = module.get<ErrorHandlerService>(ErrorHandlerService);

        mockAction = async () => {
            throw new Error('Default error message');
        };
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should handle success', async () => {
        mockAction = async () => {
            return 'SuccessData';
        };
        const result = await service.handleError('test', mockAction);
        expect(result).toBe('SuccessData');
    });

    it('should handle error', async () => {
        try {
            await service.handleError('test', mockAction);
            fail('Expected an error to be thrown');
        } catch (error) {
            expect(error.message).toBe('error during test: Default error message');
        }
    });
});
