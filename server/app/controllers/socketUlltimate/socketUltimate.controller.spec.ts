import { Test, TestingModule } from '@nestjs/testing';
import { PasswordController } from './password.controller';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { PasswordService } from '@app/services/password/password.service';
import * as request from 'supertest';

describe('PasswordController', () => {
    let passwordServiceMock: Partial<PasswordService>;
    let app: INestApplication;

    beforeEach(async () => {
        passwordServiceMock = {};
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PasswordController],
            providers: [
                {
                    provide: PasswordService,
                    useValue: passwordServiceMock,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });
    afterEach(async () => {
        await app.close();
    });

    it('should be defined', () => {
        expect(app).toBeDefined();
    });

    it('should return true when authentication succeeded', async () => {
        const password = 'justARegularPassword';

        passwordServiceMock.validatePassword = jest.fn().mockReturnValue(true);

        const response = await request(app.getHttpServer()).post('/password/validate').send(password);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: true });
    });
    it('should return false when authentication failed', async () => {
        const password = 'justARegularPassword';

        passwordServiceMock.validatePassword = jest.fn().mockReturnValue(false);

        const response = await request(app.getHttpServer()).post('/password/validate').send(password);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual({ success: false });
    });
});
