import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { Game } from '@common/definitions';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';

@Controller('games')
export class GameController {
    constructor(
        private readonly gameService: GameManager,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    @Post('/send')
    @HttpCode(HttpStatus.CREATED)
    async addGame(@Body() game: Game) {
        return this.errorHandlerService.handleError(
            'the addition of the game',
            async () => {
                return await this.gameService.addGame(game);
            },
            HttpStatus.NOT_FOUND,
        );
    }

    @Get('')
    @HttpCode(HttpStatus.OK)
    async getAllGames() {
        return this.errorHandlerService.handleError(
            'obtaining all the games',
            async () => {
                return await this.gameService.getAllGames();
            },
            HttpStatus.NOT_FOUND,
        );
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async findOne(@Param('id') id: string) {
        return this.errorHandlerService.handleError(
            'obtaining a game by ID',
            async () => {
                return await this.gameService.getGameById(id);
            },
            HttpStatus.NOT_FOUND,
        );
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async modify(@Param('id') id: string, @Body() updatedGame: Game) {
        return this.errorHandlerService.handleError(
            'the update of the game',
            async () => {
                return await this.gameService.updateGame(updatedGame, id);
            },
            HttpStatus.NOT_FOUND,
        );
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.errorHandlerService.handleError(
            'the removal of the game',
            async () => {
                return await this.gameService.deleteGame(id);
            },
            HttpStatus.NOT_FOUND,
        );
    }
}
