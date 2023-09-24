import { HttpCode, Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { GameManager } from '@app/manager/game-manager/game-manager.service';
import { Game } from '@app/interfaces';
import { HttpStatus } from '@app/http';

@Controller('game')
export class GameController {
    constructor(private readonly gameService: GameManager) {}
    @Post()
    async addGame(@Body() game: Game) {
        return await this.gameService.addGame(game);
    }

    @Get()
    async getAllGames() {
        return await this.gameService.getAllGames();
    }

    @Get(':name')
    async findOne(@Param('name') name: string) {
        return await this.gameService.getGameByName(name);
    }

    @Put(':name')
    async modify(@Param('name') name: string, @Body() updatedGame: Game) {
        return await this.gameService.updateGame(updatedGame, name);
    }

    @Delete(':name')
    @HttpCode(HttpStatus.NoContent)
    async remove(@Param('name') name: string) {
        return await this.gameService.deleteGame(name);
    }
}
