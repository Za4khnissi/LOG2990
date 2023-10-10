import { Test, TestingModule } from '@nestjs/testing';
import { FileSystemManager } from './file-system-manager.service';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import * as fs from 'fs';

describe('FileSystemManager', () => {
    let fileSystemManager: FileSystemManager;
    let path: string;
    let data: string;
    let noExistingPath: string;
    let mockErrorHandlerService: ErrorHandlerService;

    const writeFileStub = jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();
    const readFileStub = jest.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(''));

    beforeEach(async () => {
        mockErrorHandlerService = new ErrorHandlerService();
        path = 'test.json';
        data = '{"key": "value"}';
        noExistingPath = '/invalid-path-that-does-not-exist/test.json';
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileSystemManager,
                {
                    provide: ErrorHandlerService,
                    useValue: mockErrorHandlerService,
                },
            ],
        }).compile();

        fileSystemManager = module.get<FileSystemManager>(FileSystemManager);
    });

    it('should be defined', () => {
        expect(fileSystemManager).toBeDefined();
    });

    it('should not cause an error when writing', async () => {
        await expect(fileSystemManager.writeToJsonFile(path, data)).resolves.toBeUndefined();
        expect(writeFileStub).toHaveBeenCalledWith(path, data);
    });

    it('should not cause an error when reading', async () => {
        await expect(fileSystemManager.readFile(path)).resolves.toBeInstanceOf(Buffer);
        expect(readFileStub).toHaveBeenCalledWith(path);
    });

    it('should handle errors during writing', async () => {
        writeFileStub.mockRejectedValueOnce(new Error('Simulated error while writing the file'));
        await expect(fileSystemManager.writeToJsonFile(noExistingPath, data)).rejects.toThrowError();
    });

    it('should handle errors during reading', async () => {
        readFileStub.mockRejectedValueOnce(new Error('Simulated error when playing the file'));
        await expect(fileSystemManager.readFile(noExistingPath)).rejects.toThrowError();
    });
});
