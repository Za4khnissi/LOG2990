import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { MatchController } from './match.controller';

describe('MatchController (e2e)', () => {
    let app: INestApplication;
    let matchManagerServiceMock: Partial<MatchManagerService>;
    let loggerMock: Logger;

    beforeEach(async () => {
        matchManagerServiceMock = {};
        loggerMock = new Logger();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [MatchController],
            providers: [
                {
                    provide: MatchManagerService,
                    useValue: matchManagerServiceMock,
                },
                {
                    provide: Logger,
                    useValue: loggerMock,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should check code with POST request to /match/check/code', async () => {
        const code = '1234';
        matchManagerServiceMock.checkCode = jest.fn();

        const response = await request(app.getHttpServer()).post('/match/check/code').send({ code });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.text).toBe('Partie trouvée');
    });

    it('should handle errors when checking code with POST request to /match/check/code', async () => {
        const code = '4321';
        const error = new Error('Party not found');
        matchManagerServiceMock.checkCode = jest.fn(() => {
            throw error;
        });

        const response = await request(app.getHttpServer()).post('/match/check/code').send({ code });

        expect(response.status).toBe(HttpStatus.NOT_FOUND);
        expect(response.text).toBe(error.message);
    });

    it('should check username with POST request to /match/check/username', async () => {
        const code = '1234';
        const username = 'player1';
        matchManagerServiceMock.checkUsername = jest.fn().mockReturnValue({});

        const response = await request(app.getHttpServer()).post('/match/check/username').send({ code, username });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({});
    });

    it('should handle errors when checking username with POST request to /match/check/username', async () => {
        const error = new Error('Username already taken');
        matchManagerServiceMock.checkUsername = jest.fn(() => {
            throw error;
        });
    });

    it('should create a match with POST request to /match/create', async () => {
        const gameId = 'game001';
        const matchId = 'match001';
        matchManagerServiceMock.createMatch = jest.fn().mockResolvedValue(matchId);

        const response = await request(app.getHttpServer()).post('/match/create').send({ gameId });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual({ matchId });
    });

    it('should handle errors when creating a match with POST request to /match/create', async () => {
        const gameId = 'game002';
        const error = new Error('Internal server error');
        matchManagerServiceMock.createMatch = jest.fn(() => {
            throw error;
        });

        const response = await request(app.getHttpServer()).post('/match/create').send({ gameId });

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.text).toBe(error.message);
    });

    it('should get match history with GET request to /match/history', async () => {
        const matchHistory = [];
        matchManagerServiceMock.getMatchesHistory = jest.fn().mockResolvedValue(matchHistory);

        const response = await request(app.getHttpServer()).get('/match/history');

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(matchHistory);
    });

    it('should handle errors when getting match history with GET request to /match/history', async () => {
        const error = new Error('Internal server error');
        matchManagerServiceMock.getMatchesHistory = jest.fn(() => {
            throw error;
        });

        const response = await request(app.getHttpServer()).get('/match/history');

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.text).toBe(error.message);
    });

    it('should delete match history with DELETE request to /match/history', async () => {
        const matchId = 'match001';
        matchManagerServiceMock.resetMatchesHistory = jest.fn();

        const response = await request(app.getHttpServer()).delete('/match/history').send({ matchId });

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.text).toBe('Historique supprimé');
    });

    it('should handle errors when deleting match history with DELETE request to /match/history', async () => {
        const matchId = 'match002';
        const error = new Error('Internal server error');
        matchManagerServiceMock.resetMatchesHistory = jest.fn(() => {
            throw error;
        });

        const response = await request(app.getHttpServer()).delete('/match/history').send({ matchId });

        expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(response.text).toBe(error.message);
    });
});
