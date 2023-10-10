import { Game } from '@app/interfaces';
import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';

@Injectable()
export class GameManager {
    private readonly jsonPath: string;
    constructor(
        private readonly fileSystemManager: FileSystemManager,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {
        this.jsonPath = path.join('app/data/games.json');
    }

    async getAllGames(): Promise<Game[]> {
        return this.errorHandlerService.handleError('obtaining all the games', async () => {
            const fileBuffer = await this.fileSystemManager.readFile(this.jsonPath);
            const fileContent = fileBuffer.toString();
            return JSON.parse(fileContent).games;
        });
    }

    async getGameById(id: string): Promise<Game | undefined> {
        return this.errorHandlerService.handleError('obtaining a game by ID', async () => {
            const allGames = await this.getAllGames();
            return allGames.find((game: Game) => game.id === id);
        });
    }

    async addGame(game: Game): Promise<Game> {
        return this.errorHandlerService.handleError('the addition of the game', async () => {
            const games = await this.getAllGames();
            games.push(game);
            await this.fileSystemManager.writeToJsonFile(this.jsonPath, JSON.stringify({ games }));
            return game;
        });
    }

    async updateGame(game: Game, id: string): Promise<Game[] | null> {
        return this.errorHandlerService.handleError('the update of the game', async () => {
            const games = await this.getAllGames();
            const updatedGame = games.map((element: Game) => {
                if (element.id === id) {
                    // Update the game with new content
                    return game;
                }
                // Do not update this game
                return element;
            });
            const isUpdated = JSON.stringify(games) !== JSON.stringify(updatedGame);

            if (isUpdated) {
                // At least one game has been updated
                await this.fileSystemManager.writeToJsonFile(this.jsonPath, JSON.stringify({ games: updatedGame }));
                return updatedGame;
            }
            // No games have been updated
            return null;
        });
    }

    async deleteGame(id: string): Promise<boolean> {
        return this.errorHandlerService.handleError('the removal of the game', async () => {
            let isDeleted = false;
            const allGames = await this.getAllGames();
            const gameToDelete: Game = allGames.find((game: Game) => game.id === id);
            if (gameToDelete) {
                const games = allGames.filter((game: Game) => game.id !== id);
                const gameToSave = JSON.stringify({ games }, null, 2);
                await this.fileSystemManager.writeToJsonFile(this.jsonPath, gameToSave);
                isDeleted = true;
            }
            return isDeleted;
        });
    }
}
