/* eslint-disable */
import { MatchConcludedEntity } from '@app/schemas/match-concluded.schema';
import { ErrorHandlerService } from '@app/services/error-handler/error-handler.service';
import { FileSystemManager } from '@app/services/file-system-manager/file-system-manager.service';
import { GameManager } from '@app/services/game-manager/game-manager.service';
import { MatchLogicService } from '@app/services/match-logic/match-logic.service';
import { MatchInfo, MatchPlayer, MatchStatus } from '@common/definitions';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { MatchManagerService } from './match-manager.service';

class MatchLogicServiceMock extends MatchLogicService {
    matchInfo = getFakeMatch;
}

describe('matchServiceEndToEnd', () => {
    let service: MatchManagerService;

    let matchLogicServiceMock: MatchLogicServiceMock;

    const matchModelMock = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn(),
        save: jest.fn(),
        deleteMany: jest.fn().mockReturnThis(),
    };

    beforeEach(async () => {
        matchLogicServiceMock = new MatchLogicServiceMock(getFakeMatch, game);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MatchManagerService,
                Logger,
                GameManager,
                {
                    provide: MatchLogicService,
                    useValue: matchLogicServiceMock,
                },
                {
                    provide: getModelToken(MatchConcludedEntity.name),
                    useValue: Model,
                },
                FileSystemManager,
                ErrorHandlerService,
            ],
        }).compile();

        service = module.get<MatchManagerService>(MatchManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('createMatch correct', async () => {
        const fakeGame = { id: '3', title: 'FakeGame', description: 'desc1', duration: 1, questions: [], lastModification: '12-12-12' };
        const spyGetgameById = jest.spyOn(service['gameService'], 'getGameById').mockImplementation(async () => Promise.resolve(fakeGame));

        const matchId = await service.createMatch(fakeGame.id);

        expect(service.matches[matchId]).toBeDefined();
        expect(service.matches[matchId]).toBeInstanceOf(MatchLogicService);

        expect(spyGetgameById).toHaveBeenCalled();
    });

    it('checkUsername player exist', async () => {
        const course = getFakeMatchbwithplayer;
        matchLogicServiceMock.matchInfo = getFakeMatchbwithplayer;
        service.matches = { ['5081']: matchLogicServiceMock };
        try {
            service.checkUsername(course.id, 'yo');
        } catch (error) {
            expect(error.message).toBe('Joueur existe déjà');
        }
    });

    it('checkUsername banlist exist', async () => {
        const course = getFakeMatch;
        service.matches = { ['5081']: matchLogicServiceMock };

        try {
            service.checkUsername(course.id, 'jep');
        } catch (error) {
            expect(error.message).toBe('Ce Joueur est banni');
        }
    });

    it('checkUsername partie n existe pas', async () => {
        service.matches = { ['5081']: matchLogicServiceMock };
        try {
            service.checkUsername('4', 'g');
        } catch (error) {
            expect(error.message).toBe('Partie introuvable');
        }
    });

    it('checkUsername nom organisateur impossible', async () => {
        service.matches = { ['5081']: matchLogicServiceMock };
        try {
            service.checkUsername('5081', 'Organisateur');
        } catch (error) {
            expect(error.message).toBe('Pseudo interdit');
        }
    });

    it('checkUsername correct', async () => {
        const match: MatchInfo = {
            id: '5081',
            gameId: '3',
            players: [],
            blackList: ['jep'],
            currentQuestionIndex: 0,
            beginDate: new Date(2013, 9, 23),
            status: MatchStatus.WAITING,
        };
        const course = getFakeMatch;
        service.matches = { ['5081']: matchLogicServiceMock };

        await expect(service.checkUsername(course.id, 'test')).toEqual(match);
    });

    it('checkmatchexists in match finish', async () => {
        matchLogicServiceMock.matchInfo = getFakeMatchfinish;
        service.matches = { ['5081']: matchLogicServiceMock };
        try {
            service['checkMatchExists']('5081');
        } catch (error) {
            expect(error.message).toBe('Partie déjà terminée');
        }
    });

    it('checkmatchexists in match verouilled', async () => {
        matchLogicServiceMock.matchInfo = getFakeMatchlocked;
        service.matches = { ['5081']: matchLogicServiceMock };
        try {
            service['checkMatchExists']('5081');
        } catch (error) {
            expect(error.message).toBe('Partie verrouillée');
        }
    });

    it('checkmatchexists in match not find', async () => {
        service.matches = { ['5081']: matchLogicServiceMock };

        try {
            service['checkMatchExists']('4');
        } catch (error) {
            expect(error.message).toBe('Partie introuvable');
        }
    });

    it('createMatch correct', async () => {
        const spygetid = jest.spyOn(service['gameService'], 'getGameById');

        service.matches = { ['5081']: matchLogicServiceMock };

        expect(service.createMatch('3')).resolves.not.toBeUndefined();
        expect(spygetid).toHaveBeenCalled();
    });

    it('checkcode call checkMatchExists', async () => {
        const course = getFakeMatch;
        service.matches = { ['5081']: matchLogicServiceMock };

        const spycheck = jest.spyOn<any, any>(service, 'checkMatchExists'); // ici
        service.checkCode(course.id);
        expect(spycheck).toHaveBeenCalledWith(course.id);
    });

    it('saveMatchinDB should save match correctly', async () => {
        const mockMatchToSave = {
            save: jest.fn().mockResolvedValue(undefined),
        };

        jest.spyOn(service as any, 'matchModel').mockImplementation(() => mockMatchToSave);

        const matchData = {
            gameName: 'gameName',
            initialPlayerCount: 1,
            beginDate: new Date(),
            bestScore: 1,
        };

        service.saveMatchinDB(matchData);

        expect(mockMatchToSave.save).toHaveBeenCalled();
    });

    it('getMatchesHistory should retrieve match history correctly', async () => {
        const mockFindResult = []; // Replace with your expected mock data
        const mockQuery = { exec: jest.fn().mockResolvedValue(mockFindResult) };

        jest.spyOn(service['matchModel'], 'find').mockReturnValue(mockQuery as any);

        const result = await service.getMatchesHistory();

        expect(mockQuery.exec).toHaveBeenCalled();
        expect(result).toEqual(mockFindResult);
    });

    it('resetMatchesHistory should clear match history correctly', async () => {
        const mockDeleteQuery = { exec: jest.fn().mockResolvedValue({}) };

        jest.spyOn(service['matchModel'], 'deleteMany').mockReturnValue(mockDeleteQuery as any);

        service.resetMatchesHistory();

        expect(mockDeleteQuery.exec).toHaveBeenCalled();
    });
});

const player = { clientId: '8', username: 'yo', score: 0, bonusCount: 0, status: MatchPlayer.NO_TOUCH, lockedRoom: false };
const getFakeMatch: MatchInfo = {
    id: '5081',
    gameId: '3',
    players: [],
    blackList: ['jep'],
    currentQuestionIndex: 0,
    beginDate: new Date(2013, 9, 23),
    status: MatchStatus.WAITING,
};

const getFakeMatchbwithplayer: MatchInfo = {
    id: '5081',
    gameId: '3',
    players: [player],
    blackList: ['jep'],
    currentQuestionIndex: 0,
    beginDate: new Date(2013, 9, 23),
    status: MatchStatus.WAITING,
};

const getFakeMatchfinish: MatchInfo = {
    id: '5081',
    gameId: '3',
    players: [],
    blackList: ['jep'],
    currentQuestionIndex: 0,
    beginDate: new Date(2013, 9, 23),
    status: MatchStatus.FINISHED,
};

const getFakeMatchlocked: MatchInfo = {
    id: '5081',
    gameId: '3',
    players: [],
    blackList: ['jep'],
    currentQuestionIndex: 0,
    beginDate: new Date(2013, 9, 23),
    status: MatchStatus.LOCKED,
};

const game = { id: '1', title: 'Game1', description: 'desc1', duration: 1, questions: [], lastModification: '12-12-12' };
