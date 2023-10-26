import { GameController } from '@app/controllers/game/game.controller';
//import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchController } from './controllers/match/match.controller';
import { PasswordController } from './controllers/password/password.controller';
import { SocketGateway } from './gateways/socket/socket.gateway';
import { MatchEntity, MatchSchema } from './schemas/match.schema';
import { PasswordService } from './services/password/password.service';

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
        MongooseModule.forFeature([{ name: MatchEntity.name, schema: MatchSchema }]),
    ],
    controllers: [PasswordController, GameController, MatchController, GameController],
    providers: [Logger, PasswordService, FileSystemManager, GameManager, Logger, ErrorHandlerService, MatchManagerService, SocketGateway],
    exports: [ErrorHandlerService],
})
export class AppModule {}
