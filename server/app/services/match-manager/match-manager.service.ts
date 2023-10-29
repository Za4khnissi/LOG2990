import { Match, MatchStatus } from '@app/interfaces';
import { MatchDocument, MatchEntity } from '@app/schemas/match.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MatchManagerService {
    constructor(@InjectModel(MatchEntity.name) private readonly matchModel: Model<MatchDocument>) {}

    async createMatch(gameId: string): Promise<string> {
        const matchId = Math.floor(1000 + Math.random() * 9000).toString();

        const newMatch: Match = {
            id: matchId,
            gameId,
            players: [{ username: '', isOrganizer: true }],
            blackList: [],
            currentQuestionIndex: 0,
            beginDate: new Date(),
            status: MatchStatus.WAITING,
            isLocked: false,
        };

        const createdMatch = new this.matchModel(newMatch);
        await createdMatch.save();

        return matchId;
    }

    async checkCode(code: string): Promise<string> {
        const match = await this.matchModel.findOne({ id: code, status: MatchStatus.WAITING }).exec();
        if (!match) {
            throw new HttpException('Partie non trouvée', HttpStatus.NOT_FOUND);
        }
        return;
    }

    async joinMatch(code: string, username: string): Promise<Match> {
        const match = await this.matchModel.findOne({ id: code, status: MatchStatus.WAITING }).exec();
        if (!match) {
            throw new HttpException('Partie non trouvée', HttpStatus.NOT_FOUND);
        }

        if (match.players.map((player) => player.username.toLowerCase()).includes(username.toLowerCase())) {
            throw new HttpException('Joeur existe déjà', HttpStatus.CONFLICT);
        }

        if (match.blackList.map((player) => player.toLowerCase()).includes(username.toLowerCase())) {
            throw new HttpException('Cet Joeur est banni', HttpStatus.FORBIDDEN);
        }

        if (match.isLocked) {
            throw new HttpException('la room est blockee', HttpStatus.FORBIDDEN);
        }

        await this.matchModel
            .findOneAndUpdate({ id: code, status: MatchStatus.WAITING }, { $push: { players: { username, isOrganizer: false } } })
            .exec();

        return match;
    }

    async quitMatch(code: string, username: string): Promise<void> {
        const match = await this.matchModel.findOne({ id: code }).exec();

        if (!match) {
            throw new HttpException('Partie non trouvée', HttpStatus.NOT_FOUND);
        }

        if (!match.players.map((player) => player.username.toLowerCase()).includes(username.toLowerCase())) {
            throw new HttpException("Joeur n'existe pas", HttpStatus.CONFLICT);
        }

        await this.matchModel.findOneAndUpdate({ id: code }, { $pull: { players: username, isOrganizer: false } }).exec();

        return;
    }

    async lockRoom(code: string): Promise<void> {
        await this.matchModel.findOneAndUpdate({ id: code }, { isLocked: true }).exec();
    }

    async unlockRoom(code: string): Promise<void> {
        await this.matchModel.findOneAndUpdate({ id: code }, { isLocked: false }).exec();
    }

    async banUser(code: string, username: string): Promise<void> {
        await this.matchModel.findOneAndUpdate({ id: code }, { $push: { blackList: username }, $pull: { players: username } }).exec();
    }
}
