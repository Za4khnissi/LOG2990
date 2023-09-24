import { HttpStatus } from '@app/http';
import { Game } from '@app/interfaces';
import { GameManager } from '@app/manager/game-manager/game-manager.service';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { GameController } from './game.controller'; // Assurez-vous d'importer le bon contrôleur

describe('GameController (e2e)', () => {
    let app: INestApplication;
    let gameManagerMock: Partial<GameManager>;

    beforeEach(async () => {
        gameManagerMock = {};

        const module: TestingModule = await Test.createTestingModule({
            controllers: [GameController],
            providers: [
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

    it('should create a new game with POST request to /game', async () => {
        const newGame = {
            name: 'NewGame',
            description: 'NewGameDescription',
            time: 60,
            questions: [],
        };

        gameManagerMock.addGame = jest.fn().mockReturnValue(newGame);

        const response = await request(app.getHttpServer()).post('/game').send(newGame);

        expect(response.status).toBe(HttpStatus.Created);
        expect(response.body).toEqual(newGame);
    });

    it('should return all games on GET request to /game', async () => {
        const games: Game[] = [
            {
                name: 'Game1',
                description: 'Description1',
                time: 60,
                questions: [],
            },
            {
                name: 'Game2',
                description: 'Description2',
                time: 45,
                questions: [],
            },
        ];

        gameManagerMock.getAllGames = jest.fn().mockReturnValue(games);

        const response = await request(app.getHttpServer()).get('/game');

        expect(response.status).toBe(HttpStatus.Success);
        expect(response.body).toEqual(games);
    });

    it('should return a game by name on GET request to /game/:name', async () => {
        const gameName = 'Game1';
        const game: Game = {
            name: gameName,
            description: 'Description1',
            time: 60,
            questions: [],
        };

        gameManagerMock.getGameByName = jest.fn().mockReturnValue(game);

        const response = await request(app.getHttpServer()).get(`/game/${gameName}`);

        expect(response.status).toBe(HttpStatus.Success);
        expect(response.body).toEqual(game);
    });

    it('should update a game by name on PUT request to /game/:name', async () => {
        const gameName = 'Game1';
        const game: Game = {
            name: gameName,
            description: 'Description1',
            time: 60,
            questions: [],
        };
        const updatedName = 'JACKCommmmeBackkkk';
        const updatedGame: Game = {
            name: updatedName,
            description: 'desc2',
            time: 12,
            questions: [],
        };
        gameManagerMock.updateGame = jest.fn().mockReturnValue(game);

        const response = await request(app.getHttpServer()).put(`/game/${gameName}`).send(updatedGame);

        expect(response.status).toBe(HttpStatus.Success);
        expect(response.body).toEqual(game);
    });
    it('should delete a game by name on DELETE request to /game/:name', async () => {
        const gameNameToDelete = 'Game1';
        const gameList = [
            {
                name: 'Game1',
                description: 'Description1',
                time: 60,
                questions: [],
            },
            {
                name: 'Game2',
                description: 'Description2',
                time: 45,
                questions: [],
            },
        ];

        gameManagerMock.deleteGame = jest.fn().mockReturnValue(gameList.filter((game) => game.name !== gameNameToDelete));

        const response = await request(app.getHttpServer()).delete(`/game/${gameNameToDelete}`);

        expect(response.status).toBe(HttpStatus.NoContent);
        expect(gameManagerMock.deleteGame).toHaveBeenCalledWith(gameNameToDelete);
    });
});
