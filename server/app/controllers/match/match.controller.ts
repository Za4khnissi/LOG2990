import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { Body, Controller, Delete, Get, HttpStatus, Logger, Post, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('match')
export class MatchController {
    constructor(
        private readonly matchService: MatchManagerService,
        private logger: Logger,
    ) {}

    @Post('check/code')
    async checkCode(@Body('code') code: string, @Res() res: Response) {
        try {
            this.matchService.checkCode(code);
            res.status(HttpStatus.OK).send('Partie trouvée');
        } catch (e) {
            this.logger.log(e.message);
            res.status(HttpStatus.NOT_FOUND).send(e.message);
        }
    }

    @Post('check/username')
    async checkUsername(@Body('code') code: string, @Body('username') username: string, @Res() res: Response) {
        try {
            const message = this.matchService.checkUsername(code, username);
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

    @Get('history')
    async getMatchHistory(@Res() res: Response) {
        try {
            const matchHistory = await this.matchService.getMatchesHistory();
            res.status(HttpStatus.OK).send(matchHistory);
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
        }
    }

    @Delete('history')
    async deleteMatchHistory(@Res() res: Response) {
        try {
            this.matchService.resetMatchesHistory();
            res.status(HttpStatus.OK).send('Historique supprimé');
        } catch (e) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(e.message);
        }
    }
}
