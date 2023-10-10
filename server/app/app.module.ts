import { GameController } from '@app/controllers/game/game.controller';
import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordController } from './controllers/password/password.controller';
import { PasswordService } from './services/password/password.service';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
    ],
    controllers: [PasswordController, GameController],
    providers: [Logger, PasswordService, FileSystemManager, GameManager, Logger, ErrorHandlerService],
    exports: [ErrorHandlerService],
})
export class AppModule {}
