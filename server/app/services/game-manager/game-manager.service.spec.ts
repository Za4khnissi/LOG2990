import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameManager } from './game-manager.service';
import { Game } from '@app/interfaces';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';

describe('GameManagerService', () => {
    let service: GameManager;
    let fileSystemManagerMock: FileSystemManager;
    let errorHandler: ErrorHandlerService;
    let gameList: Game[];
    let noExistingGameId: string;
    beforeEach(async () => {
        errorHandler = new ErrorHandlerService();
        fileSystemManagerMock = {
            readFile: jest.fn(),
            writeToJsonFile: jest.fn(),
        } as unknown as FileSystemManager;
        gameList = [
            { id: '1', title: 'Game1', description: 'desc1', duration: 1, questions: [], lastModification: '12-12-12' },
            { id: '2', title: 'Game2', description: 'desc2', duration: 2, questions: [], lastModification: '12-12-12' },
            { id: '3', title: 'Game3', description: 'desc3', duration: 3, questions: [], lastModification: '12-12-12' },
        ];
        noExistingGameId = '202';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ErrorHandlerService,
                    useValue: errorHandler,
                },
                GameManager,
                {
                    provide: FileSystemManager,
                    useValue: fileSystemManagerMock,
                },
            ],
        }).compile();

        service = module.get<GameManager>(GameManager);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return all games', async () => {
        const gamesList = gameList;
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: gamesList })));
        const list = await service.getAllGames();
        expect(list).toEqual(gamesList);
    });
    it('should handle error when reading all games', async () => {
        const errorMessage = 'Error reading file';
        jest.spyOn(fileSystemManagerMock, 'readFile').mockRejectedValueOnce(new Error(errorMessage));

        try {
            await service.getAllGames();
        } catch (error) {
            expect(error.message).toEqual(`error during obtaining all the games: ${errorMessage}`);
        }
    });

    it('should retrieve a game by a id', async () => {
        const gameId = gameList[0].id;
        const exampleGame = gameList[0];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [exampleGame] })));

        const retrievedGame = await service.getGameById(gameId);

        expect(retrievedGame).toEqual(exampleGame);
    });

    it('should returns undefined for a game that does not exist', async () => {
        const id = noExistingGameId;
        const exampleGame = gameList[0];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [exampleGame] })));

        const retrievedGame = await service.getGameById(id);

        expect(retrievedGame).toBeUndefined();
    });

    it('should handle error when searching a game by a id', async () => {
        const errorMessage = 'Error finding a game';
        const gameId = gameList[0].id;

        jest.spyOn(fileSystemManagerMock, 'readFile').mockRejectedValueOnce(new Error(errorMessage));

        try {
            await service.getGameById(gameId);
        } catch (error) {
            expect(error.message).toContain(`${errorMessage}`);
        }
    });

    it('should add a game', async () => {
        const addedGame = gameList[1];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [] })));

        const updatedGames = await service.addGame(addedGame);
        expect(updatedGames).toEqual(addedGame);
    });
    it('should handle error when adding a game', async () => {
        const errorMessage = 'Error adding a game';
        const addedGame = gameList[1];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockRejectedValueOnce(new Error(errorMessage));

        try {
            await service.addGame(addedGame);
        } catch (error) {
            expect(error.message).toContain(`${errorMessage}`);
        }
    });

    it('should update a game', async () => {
        const updatedGame = {
            id: gameList[2].id,
            title: gameList[0].title,
            description: gameList[0].description,
            duration: gameList[0].duration,
            questions: gameList[0].questions,
            lastModification: gameList[0].lastModification,
        };
        const existingGame = gameList[2];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        const updatedGames = await service.updateGame(updatedGame, existingGame.id);

        expect(updatedGames).toHaveLength(1); // must return a array with all games(the update one too)
        expect(updatedGames[0]).toEqual(updatedGame); // verify if the only game is the new one
    });

    it('should update a game in array of two games', async () => {
        const updatedGame = {
            id: gameList[2].id,
            title: gameList[0].title,
            description: gameList[0].description,
            duration: gameList[0].duration,
            questions: gameList[0].questions,
            lastModification: gameList[0].lastModification,
        };
        const existingGame = gameList[2];
        const game2 = gameList[1];
        const gamesListBeforeUpdate = [existingGame, game2];
        const gamesListAfterUpdate = [updatedGame, game2];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: gamesListBeforeUpdate })));

        const updatedGames = await service.updateGame(updatedGame, existingGame.id);

        expect(updatedGames).toEqual(gamesListAfterUpdate);
    });
    it('should return null because there is no updated datas ', async () => {
        const existingGame = gameList[1];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        const updatedGames = await service.updateGame(existingGame, existingGame.title);
        expect(updatedGames).toBeNull();
    });

    it('should update the game with the specified id', async () => {
        const existingGame = gameList[0];
        const updatedGame = {
            id: existingGame.id,
            title: gameList[1].title,
            description: gameList[1].description,
            duration: gameList[1].duration,
            questions: gameList[1].questions,
            lastModification: gameList[1].lastModification,
        };

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        const updatedGames = await service.updateGame(updatedGame, existingGame.id);

        expect(updatedGames).toEqual([updatedGame]);
    });

    it('should handle error when updating a game', async () => {
        const errorMessage = 'Error updating a game';
        const updatedGame = {
            id: gameList[2].id,
            title: gameList[0].title,
            description: gameList[0].description,
            duration: gameList[0].duration,
            questions: gameList[0].questions,
            lastModification: gameList[0].lastModification,
        };
        const existingGame = gameList[2];

        jest.spyOn(fileSystemManagerMock, 'readFile').mockRejectedValueOnce(new Error(errorMessage));

        try {
            await service.updateGame(updatedGame, existingGame.id);
        } catch (error) {
            expect(error.message).toContain(`${errorMessage}`);
        }
    });

    it('should delete a game', async () => {
        const gameToDeleteId = gameList[0].id;
        const gamesList = gameList;

        const mockBuffer = Buffer.from(JSON.stringify({ games: gamesList }));
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(mockBuffer);

        let updatedGamesList = [...gamesList]; // Clone la list
        jest.spyOn(fileSystemManagerMock, 'writeToJsonFile').mockImplementation(async (path, data) => {
            const jsonData = JSON.parse(data);
            updatedGamesList = jsonData.games;
        });

        await service.deleteGame(gameToDeleteId);

        const deletedGame = updatedGamesList.find((game) => game.id === gameToDeleteId);
        expect(deletedGame).toBeUndefined();
    });

    it('should return undefined because no game with the specified id was found', async () => {
        const id = noExistingGameId;
        const gamesList = gameList;

        const mockBuffer = Buffer.from(JSON.stringify({ games: gamesList }));
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(mockBuffer);

        jest.spyOn(fileSystemManagerMock, 'writeToJsonFile').mockImplementation();

        const deletedGame = await service.deleteGame(id);
        expect(deletedGame).toBeFalsy();
    });

    it('should handle error when deleting a game', async () => {
        const errorMessage = 'Error deleting a game';
        const gameToDeleteId = gameList[0].id;
        const gamesList = gameList;

        const mockBuffer = Buffer.from(JSON.stringify({ games: gamesList }));
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(mockBuffer);

        jest.spyOn(fileSystemManagerMock, 'writeToJsonFile').mockRejectedValueOnce(new Error(errorMessage));

        try {
            await service.deleteGame(gameToDeleteId);
        } catch (error) {
            expect(error.message).toContain(`${errorMessage}`);
        }
    });
});
