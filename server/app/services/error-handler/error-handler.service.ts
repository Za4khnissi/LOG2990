import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class ErrorHandlerService {
    async handleError<T>(operation: string, action: () => Promise<T>, customErrorCode?: number): Promise<T> {
        try {
            return await action();
        } catch (error) {
            throw new HttpException(`error during ${operation}: ${error.message}`, customErrorCode || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
