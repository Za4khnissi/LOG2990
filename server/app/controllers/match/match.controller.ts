import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchManagerService) {}

    @Post('check')
    async checkCode(@Body('code') code: string, @Res() res: Response) {
        try {
            await this.matchService.checkCode(code);
            res.status(HttpStatus.OK).send('Party trouvée');
        } catch (e) {
            res.status(e.status).send(e.message);
        }
    }

    @Post('join')
    async joinMatch(@Body('code') code: string, @Body('username') username: string, @Res() res: Response) {
        try {
            const message = await this.matchService.joinMatch(code, username);
            res.status(HttpStatus.OK).send(message);
        } catch (e) {
            res.status(e.status).send(e.message);
        }
    }

    @Post('create')
    async createMatch(@Body('gameId') gameId: string, @Res() res: Response) {
        try {
            const matchId = await this.matchService.createMatch(gameId);
            res.status(HttpStatus.OK).send({ matchId });
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
        }
    }
}
