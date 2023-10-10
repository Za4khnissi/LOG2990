import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';

@Injectable()
export class FileSystemManager {
    constructor(private readonly errorHandlerService: ErrorHandlerService) {}
    async writeToJsonFile(path: string, data: string): Promise<void> {
        return this.errorHandlerService.handleError<void>('writing the file', async () => {
            await fsPromises.writeFile(path, data);
        });
    }

    async readFile(path: string): Promise<Buffer> {
        return this.errorHandlerService.handleError<Buffer>('reading the file', async () => {
            return await fsPromises.readFile(path);
        });
    }
}
