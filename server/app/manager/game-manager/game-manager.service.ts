import { Game } from '@app/interfaces';
import { FileSystemManager } from '@app/manager/file-system-manager/file-system-manager.service';
import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class GameManager {
    private readonly jsonPath: string;
    constructor(private readonly fileSystemManager: FileSystemManager) {
        this.jsonPath = path.join('app/data/games.json');
    }
    async getAllGames(): Promise<Game[]> {
        const fileBuffer = await this.fileSystemManager.readFile(this.jsonPath);
        const fileContent = fileBuffer.toString(); // Convertir le Buffer en chaîne de caractères
        // console.log(JSON.parse(fileContent).games);
        return JSON.parse(fileContent).games;
    }
    /**
     * TODO : Implémenter la récupération d'une playlist en fonction de son id
     * Retourne un jeu en fonction de son nom
     * @param {string} name
     * @returns Retourne la jeu en fonction de son nom
     */
    async getGameByName(name: string): Promise<Game | undefined> {
        const allGames = await this.getAllGames();
        const gameToGet: Game | undefined = allGames.find((game: Game) => game.name === name);
        if (gameToGet) {
            return gameToGet;
        }
        return undefined;
    }
    /**
     *  Ajoute une playlist dans le fichier de toutes les playlists
     * @param {Object} game nouveau jeu à ajouter
     *  @returns retourne le jeu ajouté
     */
    async addGame(game: Game): Promise<Game> {
        const games = await this.getAllGames();
        games.push(game);
        await this.fileSystemManager.writeToJsonFile(this.jsonPath, JSON.stringify({ games }));
        return game;
    }
    /**
     * TODO : Implémenter la mise à jour du jeu et du fichiers de tous les jeux
     * Modifie un jeu en fonction de son nom et met à jour le fichier de tous les jeux
     * @param {Object} game nouveau contenu du jeu
     */
    async updateGame(game: Game, name: string): Promise<Game[] | null> {
        const games = await this.getAllGames();
        const updatedGame = games.map((element: Game) => {
            if (element.name === name) {
                // Mettre à jour le jeu avec le nouveau contenu
                return game;
            }
            // Ne pas mettre à jour ce jeu
            return element;
        });
        const isUpdated = JSON.stringify(games) !== JSON.stringify(updatedGame);

        if (isUpdated) {
            // Au moins un jeu a été mise à jour
            await this.fileSystemManager.writeToJsonFile(this.jsonPath, JSON.stringify({ games: updatedGame }));
            return updatedGame;
        }
        // Aucun jeu n'a été mise à jour
        return null;
    }
    /**
     * @param {string} name identifiant du jeu
     * @returns {Promise<boolean>} true si le jeu a été supprimé, false sinon
     */
    async deleteGame(name: string): Promise<boolean> {
        const allGames = await this.getAllGames();
        const gameToDelete: Game = allGames.find((game: Game) => game.name === name);
        if (gameToDelete) {
            const games = allGames.filter((game: Game) => game.name !== name);
            const gameToSave = JSON.stringify({ games }, null, 2);
            await this.fileSystemManager.writeToJsonFile(this.jsonPath, gameToSave);
            return true;
        } else {
            return false;
        }
    }
}
