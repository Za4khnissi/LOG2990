import { CourseController } from '@app/controllers/course/course.controller';
import { DateController } from '@app/controllers/date/date.controller';
import { ExampleController } from '@app/controllers/example/example.controller';
import { ChatGateway } from '@app/gateways/chat/chat.gateway';
import { FileSystemManager } from '@app/manager/file-system-manager/file-system-manager.service';
import { GameManager } from '@app/manager/game-manager/game-manager.service';
import { Course, courseSchema } from '@app/model/database/course';
import { GameController } from '@app/routes/game/game.controller';
import { CourseService } from '@app/services/course/course.service';
import { DateService } from '@app/services/date/date.service';
import { ExampleService } from '@app/services/example/example.service';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PasswordController } from './controllers/password/password.controller';
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
        MongooseModule.forFeature([{ name: Course.name, schema: courseSchema }]),
    ],
    controllers: [CourseController, DateController, ExampleController, PasswordController, GameController],
    providers: [ChatGateway, CourseService, DateService, ExampleService, Logger, PasswordService, FileSystemManager, GameManager, Logger],
})
export class AppModule {}
