import { Controller, Get, Post, Put, Delete, Param, Body, HttpStatus, HttpCode } from '@nestjs/common';
import { Game } from '@app/interfaces';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';

@Controller('game')
export class GameController {
    constructor(
        private readonly gameService: GameManager,
        private readonly errorHandlerService: ErrorHandlerService,
    ) {}

    @Post('/send')
    async addGame(@Body() game: Game) {
        return this.errorHandlerService.handleError('the addition of the game', async () => {
            return await this.gameService.addGame(game);
        });
    }

    @Get('/all')
    async getAllGames() {
        return this.errorHandlerService.handleError('obtaining all the games', async () => {
            return await this.gameService.getAllGames();
        });
    }

    @Get(':id')
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
    async modify(@Param('id') id: string, @Body() updatedGame: Game) {
        return this.errorHandlerService.handleError('the update of the game', async () => {
            return await this.gameService.updateGame(updatedGame, id);
        });
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        return this.errorHandlerService.handleError('the removal of the game', async () => {
            return await this.gameService.deleteGame(id);
        });
    }
}
