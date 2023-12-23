/* eslint-disable no-fallthrough */
import { MatchConcludedDocument, MatchConcludedEntity } from '@app/schemas/match-concluded.schema';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { MatchLogicService } from '@app/services/match-logic/match-logic.service';
import { MAX_ACCESS_CODE, MIN_ACCESS_CODE } from '@common/constants';
import { MatchInfo, MatchStatus } from '@common/definitions';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MatchManagerService {
    matches: { [matchId: string]: MatchLogicService } = {};

    private readonly matchFinishedError = 'Partie déjà terminée';
    private readonly matchLockedError = 'Partie verrouillée';
    private readonly playerExistsError = 'Joueur existe déjà';
    private readonly playerBannedError = 'Ce Joueur est banni';
    private readonly invalidUsername = 'Pseudo interdit';
    private readonly matchNotFoundError = 'Partie introuvable';

    constructor(
        @InjectModel(MatchConcludedEntity.name) private readonly matchModel: Model<MatchConcludedDocument>,
        private readonly gameService: GameManager,
    ) {}

    async createMatch(gameId: string): Promise<string> {
        const matchId = this.generateMatchId();

        const newMatch: MatchInfo = {
            id: matchId,
            gameId,
            players: [],
            blackList: [],
            currentQuestionIndex: 0,
            beginDate: new Date(),
            status: MatchStatus.WAITING,
        };

        const game = await this.gameService.getGameById(gameId);
        const createdMatch = new MatchLogicService(newMatch, game);
        this.matches[matchId] = createdMatch;
        return matchId;
    }

    checkCode(code: string): void {
        this.checkMatchExists(code);
    }

    checkUsername(code: string, username: string): MatchInfo {
        const match: MatchInfo = this.checkMatchExists(code);
        const usernameLower = username.toLowerCase();

        if (usernameLower === 'organisateur') {
            this.throwHttpException(this.invalidUsername, HttpStatus.CONFLICT);
        }

        if (match.players.some((player) => player.username.toLowerCase() === usernameLower)) {
            this.throwHttpException(this.playerExistsError, HttpStatus.CONFLICT);
        }

        if (match.blackList.some((player) => player.toLowerCase() === usernameLower)) {
            this.throwHttpException(this.playerBannedError, HttpStatus.FORBIDDEN);
        }

        return match;
    }

    saveMatchinDB(match: MatchConcludedEntity): void {
        const matchToSave = new this.matchModel(match);
        matchToSave.save();
    }

    async getMatchesHistory(): Promise<MatchConcludedEntity[]> {
        return this.matchModel.find().exec();
    }

    resetMatchesHistory(): void {
        this.matchModel.deleteMany({}).exec();
    }

    private generateMatchId(): string {
        return Math.floor(MIN_ACCESS_CODE + Math.random() * MAX_ACCESS_CODE).toString();
    }

    private throwHttpException(message: string, status: HttpStatus): never {
        throw new HttpException(message, status);
    }

    private checkMatchExists(code: string): MatchInfo {
        const match = this.matches[code];
        if (!match) {
            this.throwHttpException(this.matchNotFoundError, HttpStatus.NOT_FOUND);
        }

        switch (match.matchInfo.status) {
            case MatchStatus.FINISHED:
                this.throwHttpException(this.matchFinishedError, HttpStatus.FORBIDDEN);
            case MatchStatus.LOCKED:
                this.throwHttpException(this.matchLockedError, HttpStatus.FORBIDDEN);
        }

        return match.matchInfo;
    }
}
