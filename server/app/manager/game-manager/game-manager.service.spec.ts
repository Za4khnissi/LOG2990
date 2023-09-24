import { FileSystemManager } from '@app/manager/file-system-manager/file-system-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameManager } from './game-manager.service';

describe('GameManagerService', () => {
    let service: GameManager;
    let fileSystemManagerMock: FileSystemManager; // Déclaration d'un mock pour FileSystemManager

    beforeEach(async () => {
        // Création d'un mock pour FileSystemManager avec des méthodes simulées
        fileSystemManagerMock = {
            readFile: jest.fn(),
            writeToJsonFile: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameManager,
                {
                    provide: FileSystemManager, // Fourniture du mock FileSystemManager
                    useValue: fileSystemManagerMock, // Utilisation du mock comme valeur
                },
            ],
        }).compile();

        service = module.get<GameManager>(GameManager); // Récupération de l'instance du service GameManager
    });

    it('should be defined', () => {
        expect(service).toBeDefined(); // Vérification que le service est défini (a été instancié)
    });

    it('should return all games', async () => {
        const gamesList = [
            { name: 'Game1', description: 'desc1', time: 1, questions: [] },
            { name: 'Game2', description: 'desc2', time: 2, questions: [] },
            { name: 'Game3', description: 'desc3', time: 3, questions: [] },
        ];
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: gamesList })));
        const list = await service.getAllGames();
        expect(list).toEqual(gamesList); // Vérification que le service est défini (a été instancié)
    });

    it('should retrieve a game by a name', async () => {
        const gameName = 'ExampleGame';
        const gameDescription = 'lalala';
        const exampleGame = { name: gameName, description: gameDescription };

        // Configure the mock for readFile
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [exampleGame] })));

        const retrievedGame = await service.getGameByName(gameName);

        expect(retrievedGame).toEqual(exampleGame);
    });

    it('should returns undefined for a game that does not exist', async () => {
        const gameName = 'ExampleGame';
        const gameDescription = 'lalala';
        const noExistgameName = 'NonExistentGame';
        const exampleGame = { name: gameName, description: gameDescription };

        // Configure the mock for readFile
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [exampleGame] })));

        const retrievedGame = await service.getGameByName(noExistgameName);

        expect(retrievedGame).toBeUndefined();
    });

    it('should add a game', async () => {
        const gameToAddName = 'AddName';
        const gameToAddDescription = 'AddDescription';
        const gameToAddTime = 60;
        const addedGame = { name: gameToAddName, description: gameToAddDescription, time: gameToAddTime, questions: [] };

        // Configure the mock for readFile to return the existing game
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [] })));

        const updatedGames = await service.addGame(addedGame);
        expect(updatedGames).toEqual(addedGame);
    });

    it('should update a game', async () => {
        const existingGameName = 'ExistingGame';
        const updateGameName = 'UpdateGame';
        const existingGameDescription = 'lalala';
        const updatedGameDescription = 'coucou';
        const existingTime = 60;
        const updatedTime = 90;
        const updatedGame = { name: updateGameName, description: updatedGameDescription, time: updatedTime, questions: [] };
        const existingGame = { name: existingGameName, description: existingGameDescription, time: existingTime, questions: [] };

        // Configure the mock for readFile to return the existing game
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        const updatedGames = await service.updateGame(updatedGame, existingGameName);

        expect(updatedGames).toHaveLength(1); // must return a array with all games(the update one too)
        expect(updatedGames[0]).toEqual(updatedGame); // verify if the only game is the new one
    });

    it('should update a game in array of two games', async () => {
        const existingGameName = 'ExistingGame';
        const existingGameDescription = 'lalala';
        const existingTime = 60;
        const updateGameName = 'UpdateName';
        const updatedGameDescription = 'UpdateDescription';
        const updatedTime = 90;
        const game2Name = 'kia';
        const game2Description = 'kamehameha';
        const game2Time = 70;

        const updatedGame = { name: updateGameName, description: updatedGameDescription, time: updatedTime, questions: [] };
        const existingGame = { name: existingGameName, description: existingGameDescription, time: existingTime, questions: [] };
        const game2 = { name: game2Name, description: game2Description, time: game2Time, questions: [] };
        const gamesListBeforeUpdate = [existingGame, game2];
        const gamesListAfterUpdate = [updatedGame, game2];

        // Configure the mock for readFile to return the existing game
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: gamesListBeforeUpdate })));

        const updatedGames = await service.updateGame(updatedGame, existingGameName);

        expect(updatedGames).toEqual(gamesListAfterUpdate);
    });
    it('should return null because there is no update datas ', async () => {
        const existingGameName = 'ExistingGame';
        const existingGameDescription = 'lalala';
        const existingTime = 60;

        const existingGame = { name: existingGameName, description: existingGameDescription, time: existingTime, questions: [] };

        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        const updatedGames = await service.updateGame(existingGame, existingGameName);
        expect(updatedGames).toBeNull();
    });

    it('should update the game with the specified name', async () => {
        const existingGameName = 'ExistingGame';
        const existingGameDescription = 'lalala';
        const existingTime = 60;
        const updatedDescription = 'UpdatedDescription';
        const updatedTime = 90;

        const existingGame = { name: existingGameName, description: existingGameDescription, time: existingTime, questions: [] };
        const updatedGame = { name: existingGameName, description: updatedDescription, time: updatedTime, questions: [] };

        // Configure the mock for readFile to return the existing game
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(Buffer.from(JSON.stringify({ games: [existingGame] })));

        // Call updateGame with updated game data
        const updatedGames = await service.updateGame(updatedGame, existingGameName);

        // Ensure that the updateGame method updates the game with the specified name
        expect(updatedGames).toEqual([updatedGame]);
    });

    it('should delete a game', async () => {
        const gameToDeleteName = 'GameToDelete';
        const gamesList = [
            { name: 'Game1', description: 'desc1', time: 1, questions: [] },
            { name: gameToDeleteName, description: 'delete', time: 1, questions: [] },
            { name: 'Game2', description: 'desc2', time: 2, questions: [] },
        ];

        // Configure the mock for readFile to return the games list
        const mockBuffer = Buffer.from(JSON.stringify({ games: gamesList }));
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(mockBuffer);

        // Mock the writeFile method to capture the updated game list
        let updatedGamesList = [...gamesList]; // Clone the list
        jest.spyOn(fileSystemManagerMock, 'writeToJsonFile').mockImplementation(async (path, data) => {
            // Update the in-memory list with the deleted game
            const jsonData = JSON.parse(data);
            updatedGamesList = jsonData.games;
        });

        // Call the deleteGame method
        await service.deleteGame(gameToDeleteName);

        // Assert that the game with name 'Game2' is no longer in the updated game list
        const deletedGame = updatedGamesList.find((game) => game.name === gameToDeleteName);
        expect(deletedGame).toBeUndefined();
    });

    it('should return undefined because no game with the specified name was found', async () => {
        const gameToDeleteName = 'GameToDelete';
        const gamesList = [
            { name: 'Game1', description: 'desc1', time: 1, questions: [] },
            { name: 'Game2', description: 'desc2', time: 2, questions: [] },
            { name: 'Game3', description: 'desc3', time: 3, questions: [] },
        ];

        // Configure the mock for readFile to return the games list
        const mockBuffer = Buffer.from(JSON.stringify({ games: gamesList }));
        jest.spyOn(fileSystemManagerMock, 'readFile').mockResolvedValueOnce(mockBuffer);

        jest.spyOn(fileSystemManagerMock, 'writeToJsonFile').mockImplementation();

        // Call the deleteGame method
        const deletedGame = await service.deleteGame(gameToDeleteName);
        expect(deletedGame).toBeFalsy();
    });
});
