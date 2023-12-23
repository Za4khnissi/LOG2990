/* eslint-disable */
import { TestBed, fakeAsync, flush, waitForAsync } from '@angular/core/testing';

import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketClientService } from '@app/services/socket.client.service';
import { MatchApiResponse, MatchInfo, MatchPlayer, MatchStatus, Player } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { of, throwError } from 'rxjs';
import { Socket } from 'socket.io-client';
import { SocketTestHelper } from 'src/app/classes/socket-test-helper';
import { CommunicationService } from './communication.service';
import { MatchHandlerService } from './match-handler.service';
import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }

    override disconnect() {
        // nothing
    }
}
describe('MatchHandlerService', () => {
    let service: MatchHandlerService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['checkCode', 'checkUsername', 'getGameById']);

        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceMock.socket = socketHelper as any as Socket;
        communicationServiceSpy.getGameById.and.returnValue(
            of({
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            }),
        );
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, BrowserModule],

            providers: [
                { provide: CommunicationService, useValue: communicationServiceSpy },
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
        });
    });

    beforeEach(() => {
        service = TestBed.inject(MatchHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should verify that the correct checkcode receives the correct data', () => {
        communicationServiceSpy.checkCode.and.returnValue(of(new HttpResponse<string>({ status: 200, statusText: 'Ok' })));
        service.checkCode('5081');
        expect(communicationServiceSpy.checkCode).toHaveBeenCalledWith('5081');
    });

    it('should setupHistogramData QCM resultpage false', () => {
        service.game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [
                { type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [{ text: 'force', isCorrect: false }] },
                { type: 'QRL', text: 'What is the capital of France?', points: 10 },
            ],
            lastModification: '23-01-2332',
            visible: true,
        };

        expect(service.setupHistogramData(0, false)).toEqual({
            barChartData: {
                labels: ['force'],
                datasets: [{ data: [0], backgroundColor: ['red'] }],
            },
            xAxisLabel: 'Choix possibles',
            legendLabels: [
                { text: 'Correct', fillStyle: 'green' },
                { text: 'Incorrect', fillStyle: 'red' },
            ],
        });
    });

    it('should setupHistogramData QCM', () => {
        service.game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [
                { type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [{ text: 'force', isCorrect: false }] },
                { type: 'QRL', text: 'What is the capital of France?', points: 10 },
            ],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.questionHistograms = [
            [1, 2],
            [2, 3],
        ];
        expect(service.setupHistogramData(0, true)).toEqual({
            barChartData: {
                labels: ['force'],
                datasets: [{ data: [1, 2], backgroundColor: ['red'] }],
            },
            xAxisLabel: 'Choix possibles',
            legendLabels: [
                { text: 'Correct', fillStyle: 'green' },
                { text: 'Incorrect', fillStyle: 'red' },
            ],
        });
    });
    it('should setupHistogramData QRL resutpage false', () => {
        service.game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [
                { type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [{ text: 'force', isCorrect: false }] },
                { type: 'QRL', text: 'What is the capital of France?', points: 10 },
            ],
            lastModification: '23-01-2332',
            visible: true,
        };

        expect(service.setupHistogramData(1, false)).toEqual({
            barChartData: {
                labels: ['A interagi', "N'a pas interagi"],
                datasets: [{ data: [0, 0], backgroundColor: ['green', 'red'] }],
            },
            xAxisLabel: 'Interactions',
            legendLabels: [],
        });
    });

    it('should setupHistogramData QRL resutpage true', () => {
        service.game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [
                { type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [{ text: 'force', isCorrect: false }] },
                { type: 'QRL', text: 'What is the capital of France?', points: 10 },
            ],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.questionHistograms = [
            [1, 2],
            [2, 3],
        ];
        expect(service.setupHistogramData(1, true)).toEqual({
            barChartData: {
                labels: ['0%', '50%', '100%'],
                datasets: [{ data: [2, 3], backgroundColor: ['red', 'yellow', 'green'] }],
            },
            xAxisLabel: 'Points',
            legendLabels: [],
        });
    });

    it(' should verify that the correct checkUsername receives the correct data', () => {
        communicationServiceSpy.checkUsername.and.returnValue(of(new HttpResponse<MatchInfo>({ status: 200, statusText: 'Ok' })));
        service.accessCode = '5081';
        service.checkUsername('yo');
        expect(communicationServiceSpy.checkUsername).toHaveBeenCalledWith('5081', 'yo');
    });

    it('should verify that the incorrect checkcode receives the correct data', waitForAsync(() => {
        communicationServiceSpy.checkCode.and.returnValue(of(new HttpResponse<string>({ status: 404, statusText: 'partie non trouvée' })));
        service.checkCode('5081');

        service.checkCode('5081').subscribe((data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(data).toEqual({ body: null, status: false } as any as MatchApiResponse<string>);
        });
    }));

    it('should verify that the incorrect checkUsername receives the correct data', waitForAsync(() => {
        communicationServiceSpy.checkUsername.and.returnValue(of(new HttpResponse<MatchInfo>({ status: 500 })));
        service.checkUsername('yo');

        service.checkUsername('yo').subscribe((data) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(data).toEqual({ body: undefined, status: false } as any as MatchApiResponse<string>);
        });
    }));
    it('should retrieve the code and message corresponding to a correct response from the checkode', waitForAsync(() => {
        communicationServiceSpy.checkCode.and.returnValue(of(new HttpResponse<string>({ status: 200 })));
        service.checkCode('5081');

        service.checkCode('5081').subscribe((data) => {
            expect(service.accessCode).toEqual('5081');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            expect(data).toEqual({ body: null, status: true } as any as MatchApiResponse<string>);
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as any as MatchApiResponse<string>;
    it('should retrieve the username, an id of the selectedgame corresponding to a correct response from the checkUsername', () => {
        const match: MatchInfo = {
            id: '1234',
            gameId: '2',
            players: [],
            blackList: [],
            currentQuestionIndex: 0,
            beginDate: new Date(),
            status: MatchStatus.WAITING,
        };
        communicationServiceSpy.checkUsername.and.returnValue(of(new HttpResponse<MatchInfo>({ status: 200, body: match })));
        service.checkUsername('yo');
        service.accessCode = '5081';
        service.checkUsername('yo').subscribe(() => {
            expect(service.username).toEqual('yo');
            expect(service.selectedGameId).toEqual('2');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any as MatchApiResponse<string>;
    });

    it('should retrieve the message corresponding to a correct response from the cherckusername with any body', () => {
        service.selectedGameId = '0';
        communicationServiceSpy.checkUsername.and.returnValue(of(new HttpResponse<MatchInfo>({ status: 200, body: null })));
        service.checkUsername('yo');
        service.accessCode = '5081';
        //      let spy = spyOn(service['socketService'], 'connect');
        //      let spy = spyOn(service['socketService'], 'connect');
        service.checkUsername('yo').subscribe(() => {
            expect(service.username).toEqual('yo');
            expect(service.selectedGameId).toEqual('0');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any as MatchApiResponse<string>;
    });
    it('should send the update player event which modifies the player list', () => {
        service.players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        const player: Player[] = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('updatePlayers', player);
        expect(service.players.length).toBe(1);
        expect(service.players[0].username).toBe('jack');
    });

    it('should send the HistogramsData ', () => {
        service.questionHistograms = [[]];
        const FIRST_CHOICE_QUESTION_ONE = 1;
        const SECOND_CHOICE_QUESTION_ONE = 2;
        const FIRST_CHOICE_QUESTION_TWO = 3;
        const SECOND_CHOICE_QUESTION_TWO = 4;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('HistogramsData', [
            [FIRST_CHOICE_QUESTION_ONE, SECOND_CHOICE_QUESTION_ONE],
            [FIRST_CHOICE_QUESTION_TWO, SECOND_CHOICE_QUESTION_TWO],
        ]);
        expect(service.questionHistograms).toEqual([
            [FIRST_CHOICE_QUESTION_ONE, SECOND_CHOICE_QUESTION_ONE],
            [FIRST_CHOICE_QUESTION_TWO, SECOND_CHOICE_QUESTION_TWO],
        ]);
    });

    it('should send the playerremoved correct hastarted true ', () => {
        service.players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        service.hasStarted = true;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('playerRemoved', 'job');

        expect(service.withdrawnPlayers.length).toEqual(1);
    });

    it('should send the playerremoved correct hastarted false ', () => {
        service.players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        service.hasStarted = false;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('playerRemoved', 'job');
        expect(service.players.length).toEqual(0);
    });

    it('should send the playerremoved incorrect ', () => {
        service.players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('playerRemoved', 'yo');
        expect(service.players.length).toEqual(1);
    });

    it('should send the reset all ', () => {
        service.accessCode = '2233';
        service.username = 'yo';
        service.isOrganizer = true;
        service.selectedGameId = '4';
        service.players = [
            {
                clientId: '3',
                username: 'job',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        service.questionHistograms = [[1]];
        service.bannedPlayers = ['yo'];
        service.withdrawnPlayers = ['yo'];
        service.hasStarted = true;

        service.reset();
        expect(service.accessCode).toEqual('');
        expect(service.username).toEqual('');
        expect(service.isOrganizer).toEqual(false);
        expect(service.selectedGameId).toEqual('');
        expect(service.players.length).toEqual(0);
        expect(service.questionHistograms.length).toEqual(0);
        expect(service.bannedPlayers.length).toEqual(0);
        expect(service.withdrawnPlayers.length).toEqual(0);
        expect(service.hasStarted).toEqual(false);
    });

    it('should send the remove player event which removes an item from the player list', () => {
        service.players = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        service.hasStarted = false;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.RemovePlayer, 'jack');
        expect(service.players.length).toBe(1);
    });

    it('should send the remove player event which removes an item  if its not in the player list', () => {
        service.players = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        service.hasStarted = true;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.RemovePlayer, 'jack');
        expect(service.withdrawnPlayers.length).toBe(0);
    });

    it('should send the updateBlackList event which adds a banned player to the banned player list', () => {
        const blackList = ['jean'];

        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('updateBlackList', blackList);
        expect(service.bannedPlayers.length).toBe(1);
    });

    it('should check if the organizer is there', () => {
        const createroomspy = spyOn(service['socketService'], 'createWaitingRoom');
        service.isOrganizer = true;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('waitingRoomCreated', '5187');
        expect(createroomspy).toHaveBeenCalled();
        expect(service.accessCode).toEqual('5187');
    });

    it('should check if the organizer is there and the code is invalid', () => {
        const createroomspy = spyOn(service['socketService'], 'createWaitingRoom');
        const alertSpy = spyOn(window, 'alert').and.stub();
        service.isOrganizer = true;
        service.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('waitingRoomCreated', undefined);
        expect(createroomspy).toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledWith("Erreur lors de la création de la salle d'attente");
    });

    it('should send an error message in checkCode', () => {
        communicationServiceSpy.checkCode.and.returnValue(throwError({ error: '' }));
        service.checkCode('5081').subscribe({
            next: (res) => {
                expect(res).toEqual({ status: false, body: '' });
            },
        });
    });

    it('should send an error message in checkUsername', fakeAsync(() => {
        communicationServiceSpy.checkUsername.and.returnValue(throwError({ error: '' }));

        service.checkUsername('yo').subscribe((error) => {
            expect(error).toEqual(
                { status: false, body: '' },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ) as any as MatchApiResponse<string | undefined>;
        });
        flush();
    }));
});
