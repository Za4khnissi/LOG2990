import { Test, TestingModule } from '@nestjs/testing';
import { promises as fsPromises } from 'fs';
import { FileSystemManager } from './file-system-manager.service';

describe('FileSystemManagerService', () => {
    let service: FileSystemManager;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileSystemManager],
        }).compile();

        service = module.get<FileSystemManager>(FileSystemManager);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('readFile', () => {
        it('should read the content of the fantom file games-test.json', async () => {
            const readSpy = jest.spyOn(fsPromises, 'readFile').mockResolvedValue(Buffer.from('File Content'));
            const content = await service.readFile('test-data/games-test.json');
            expect(content.toString()).toBe('File Content');
            expect(readSpy).toHaveBeenCalledWith('test-data/games-test.json');
        });

        it('should handle file read error', async () => {
            // simulate a file read error
            const readSpy = jest.spyOn(fsPromises, 'readFile').mockRejectedValue(new Error('File Read Error'));

            try {
                await service.readFile('non-existent-file.json');
            } catch (error) {
                expect(error.message).toBe('File Read Error');
            }

            expect(readSpy).toHaveBeenCalledWith('non-existent-file.json');
        });
    });

    describe('writeToJsonFile', () => {
        it('should write JSON data to a fantom file games-test.json', async () => {
            const writeSpy = jest.spyOn(fsPromises, 'writeFile').mockResolvedValue();

            const jsonData = { key: 'value' };
            await service.writeToJsonFile('test-data/games-test.json', JSON.stringify(jsonData)); // Utilisez le chemin vers le fichier de test

            expect(writeSpy).toHaveBeenCalledWith('test-data/games-test.json', JSON.stringify(jsonData));
        });

        it('should handle file write error', async () => {
            // simulate a write error in a file
            const writeSpy = jest.spyOn(fsPromises, 'writeFile').mockRejectedValue(new Error('File Write Error'));

            const jsonData = { key: 'value' };

            try {
                await service.writeToJsonFile('invalid-directory/games-test.json', JSON.stringify(jsonData));
            } catch (error) {
                expect(error.message).toBe('File Write Error');
            }

            expect(writeSpy).toHaveBeenCalledWith('invalid-directory/games-test.json', JSON.stringify(jsonData));
        });
    });
});
