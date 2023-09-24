import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';

@Injectable()
export class FileSystemManager {
    /**
     * Écrit les données dans un fichier
     * @param {string} path : le chemin qui correspond au fichier JSON
     * @param {string} data : l'information à sauvegarder en string
     * @returns {Promise<void>} aucune valeur retournée
     */
    async writeToJsonFile(path: string, data: string): Promise<void> {
        return await fsPromises.writeFile(path, data);
    }

    /**
     * Lit et retourne le contenu d'un fichier
     * @param {string} path : le chemin qui correspond au fichier JSON
     * @returns {Promise<Buffer>} le contenu du fichier sous la forme de Buffer
     */
    async readFile(path: string): Promise<Buffer> {
        return await fsPromises.readFile(path);
    }
}
