import { GameController } from '@app/controllers/game/game.controller';
import { MatchConcludedEntity, MATCH_CONCLUDED_SCHEMA } from '@app/schemas/match-concluded.schema';
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
import { MatchLogicService } from './services/match-logic/match-logic.service';
import { PasswordService } from './services/password/password.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'),
            }),
        }),
        MongooseModule.forFeature([{ name: MatchConcludedEntity.name, schema: MATCH_CONCLUDED_SCHEMA }]),
    ],
    controllers: [PasswordController, GameController, MatchController, GameController],
    providers: [
        Logger,
        PasswordService,
        FileSystemManager,
        GameManager,
        Logger,
        ErrorHandlerService,
        MatchManagerService,
        SocketGateway,
        MatchLogicService,
    ],
    exports: [ErrorHandlerService],
})
export class AppModule {}
