/* eslint-disable max-lines */
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Classification, MatchPlayer, Player, TimeInfo, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { Socket } from 'socket.io-client';
import { GameplayLogicService } from './gameplay-logic.service';
import { SocketClientService } from './socket.client.service';

const TIMER = 0;
const PROGRESS = 0;

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }

    override disconnect() {
        // nothing
    }
}

describe('GameplayLogicService', () => {
    let service: GameplayLogicService;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceMock.socket = socketHelper as any as Socket;
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [{ provide: SocketClientService, useValue: socketServiceMock }],
        });
    });

    beforeEach(() => {
        service = TestBed.inject(GameplayLogicService);
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a new user in the rooomMessage', () => {
        service.roomMessages = [];
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('roomMessage', '5187');
        socketHelper.peerSideEmit('username', 'yo');
        expect(service.roomMessages.length).toEqual(1);
    });

    it(' should start the timer for all roomusers', () => {
        const time: TimeInfo = { remainingTime: 0, initialTime: 30 };
        const spypanicsound = spyOn(service.panicSound, 'pause');
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.QuestionCountdown, time);
        expect(service.timeLeft).toEqual(TIMER);
        expect(service.progressValue).toEqual(PROGRESS);
        expect(spypanicsound).toHaveBeenCalled();
    });

    it(' should send stateColorChange', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const player: Player = {
            clientId: '3',
            username: 'job',
            score: 0,
            bonusCount: 0,
            status: MatchPlayer.SELECT,
            lockedRoom: false,
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.stateColorChange, player);
        expect(service['matchHandler'].players[0]).toEqual(player);
    });

    it(' should send classificationChange name ascendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: true,
            classificationType: 'name',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[0].username).toEqual('a');
        expect(service['matchHandler'].players[1].username).toEqual('job');
    });

    it(' should send classificationChange name descendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: false,
            classificationType: 'name',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[1].username).toEqual('a');
        expect(service['matchHandler'].players[0].username).toEqual('job');
    });

    it(' should send classificationChange SCORE descendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: false,
            classificationType: 'score',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[0].username).toEqual('a');
        expect(service['matchHandler'].players[1].username).toEqual('job');
    });

    it(' should send classificationChange SCORE descendant (equal score)', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: false,
            classificationType: 'score',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[1].username).toEqual('a');
        expect(service['matchHandler'].players[0].username).toEqual('job');
    });

    it(' should send classificationChange SCORE ascendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: true,
            classificationType: 'score',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[1].username).toEqual('a');
        expect(service['matchHandler'].players[0].username).toEqual('job');
    });

    it(' should send classificationChange SCORE ascendant (equal score)', () => {
        service['matchHandler'].players = [
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: true,
            classificationType: 'score',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[0].username).toEqual('a');
        expect(service['matchHandler'].players[1].username).toEqual('job');
    });

    it(' should send classificationChange State ascendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.SELECT,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: true,
            classificationType: 'state',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[0].username).toEqual('a');
        expect(service['matchHandler'].players[1].username).toEqual('job');
    });

    it(' should send classificationChange State ascendant (equal state)', () => {
        service['matchHandler'].players = [
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: true,
            classificationType: 'state',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[0].username).toEqual('a');
        expect(service['matchHandler'].players[1].username).toEqual('job');
    });
    it(' should send classificationChange State descendant', () => {
        service['matchHandler'].players = [
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.SELECT,
                lockedRoom: false,
            },
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: false,
            classificationType: 'state',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[1].username).toEqual('a');
        expect(service['matchHandler'].players[0].username).toEqual('job');
    });

    it(' should send classificationChange State descendant (Equal state)', () => {
        service['matchHandler'].players = [
            {
                clientId: '4',
                username: 'a',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '3',
                username: 'job',
                score: 15,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        const classificationactuel: Classification = {
            classificationChoice: false,
            classificationType: 'state',
        };
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.classificationChange, classificationactuel);
        expect(service['matchHandler'].players[1].username).toEqual('a');
        expect(service['matchHandler'].players[0].username).toEqual('job');
    });

    it(' should send togglechoice true', () => {
        const player: Player = {
            clientId: '3',
            username: 'job',
            score: 15,
            bonusCount: 0,
            status: MatchPlayer.NO_TOUCH,
            lockedRoom: true,
        };

        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.toggleChatLock, player);
        expect(service.message).toEqual('votre organisateur a désactivé votre accès au chat');
        expect(service.color).toEqual('red');
    });

    it(' should send togglechoice false', () => {
        const player: Player = {
            clientId: '3',
            username: 'job',
            score: 15,
            bonusCount: 0,
            status: MatchPlayer.NO_TOUCH,
            lockedRoom: false,
        };

        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.toggleChatLock, player);
        expect(service.message).toEqual('votre organisateur a activé votre accès au chat');
        expect(service.color).toEqual('green');
    });

    it(' should send NewTimerState', () => {
        const newtimeState: TimerState = TimerState.PANIC;
        const spypanicsound = spyOn(service.panicSound, 'play');
        service['matchHandler'].isOrganizer = false;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.NewTimerState, newtimeState);
        expect(service.timerState).toEqual(newtimeState);
        expect(spypanicsound).toHaveBeenCalled();
    });

    it('should start the game for all players', () => {
        const spyconfigur = spyOn(service, 'configureBaseSocketFeatures');
        service.start();
        expect(spyconfigur).toHaveBeenCalled();
    });
});
