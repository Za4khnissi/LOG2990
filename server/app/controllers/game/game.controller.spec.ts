import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Game } from '@common/definitions';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { GameController } from './game.controller';

describe('GameController (e2e)', () => {
    let app: INestApplication;
    let gameManagerMock: Partial<GameManager>;
    let gameList: Game[];
    let errorHandler: ErrorHandlerService;

    beforeEach(async () => {
        gameManagerMock = {};
        errorHandler = new ErrorHandlerService();
        gameList = [
            {
                id: '00',
                title: 'Game1',
                description: 'Description1',
                duration: 60,
                questions: [],
                lastModification: '12-12-12',
            },
            {
                id: '01',
                title: 'Game2',
                description: 'Description2',
                duration: 45,
                questions: [],
                lastModification: '12-12-12',
            },
        ];

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
                {
                    provide: ErrorHandlerService,
                    useValue: errorHandler,
                },
                {
                    provide: GameManager,
                    useValue: gameManagerMock,
                },
            ],
        }).compile();

        app = module.createNestApplication();
        await app.init();
    });

    afterEach(async () => {
        await app.close();
    });

    it('should create a new game with POST request to /game/send', async () => {
        const newGame = gameList[0];
        gameManagerMock.addGame = jest.fn().mockReturnValue(newGame);
        const response = await request(app.getHttpServer()).post('/games/send').send(newGame);
        expect(response.status).toBe(HttpStatus.CREATED);
        expect(response.body).toEqual(newGame);
    });

    it('should return all games on GET request to /game/all', async () => {
        const games: Game[] = gameList;
        gameManagerMock.getAllGames = jest.fn().mockReturnValue(games);
        const response = await request(app.getHttpServer()).get('/games');
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(games);
    });

    it('should return a game by id on GET request to /game/:id', async () => {
        const gameId = gameList[0].id;
        const game: Game = gameList[0];
        gameManagerMock.getGameById = jest.fn().mockReturnValue(game);
        const response = await request(app.getHttpServer()).get(`/games/${gameId}`);
        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(game);
    });
    it('should return 404 not found on GET request to /game/:id', async () => {
        const nonExistentGameId = 'nonexistentgameid';
        const response = await request(app.getHttpServer()).get(`/game/${nonExistentGameId}`);
        expect(response.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('should update a game by id on PUT request to /game/:id', async () => {
        const gameId = gameList[0].id;
        const game: Game = gameList[0];
        const updatedGame: Game = {
            id: gameId,
            title: gameList[1].title,
            description: gameList[1].description,
            duration: gameList[1].duration,
            questions: [],
            lastModification: gameList[1].lastModification,
        };

        gameManagerMock.updateGame = jest.fn().mockReturnValue(game);

        const response = await request(app.getHttpServer()).put(`/games/${gameId}`).send(updatedGame);

        expect(response.status).toBe(HttpStatus.OK);
        expect(response.body).toEqual(game);
    });
    it('should delete a game by id on DELETE request to /game/:id', async () => {
        const gameIdToDelete = gameList[0].id;
        gameManagerMock.deleteGame = jest.fn().mockReturnValue(gameList.filter((game) => game.id !== gameIdToDelete));
        const response = await request(app.getHttpServer()).delete(`/games/${gameIdToDelete}`);
        expect(response.status).toBe(HttpStatus.NO_CONTENT);
        expect(gameManagerMock.deleteGame).toHaveBeenCalledWith(gameIdToDelete);
    });
});
