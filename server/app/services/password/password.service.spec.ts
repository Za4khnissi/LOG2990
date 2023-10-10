import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';

describe('PasswordService', () => {
    let service: PasswordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PasswordService],
        }).compile();

        service = module.get<PasswordService>(PasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
    it('should return false if no correct password', () => {
        const password = 'kikou';
        expect(service.validatePassword(password)).toEqual(false);
    });
    it('should return true if correct password', () => {
        const password = 'zakarya';
        expect(service.validatePassword(password)).toEqual(true);
    });
});
