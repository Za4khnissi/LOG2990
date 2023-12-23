/* eslint-disable @typescript-eslint/no-magic-numbers*/
/* eslint-disable max-classes-per-file*/
/* eslint-disable max-lines*/
import { DialogModule } from '@angular/cdk/dialog';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, inject, tick } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { AnswersGradingDialogComponent } from '@app/components/answers-grading-dialog/answers-grading-dialog.component';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { TransitionDialogComponent } from '@app/components/transition-dialog/transition-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { Game, MatchPlayer, Player, QrlAnswer } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { NgChartsModule } from 'ng2-charts';
import { Subject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { OrganizerPageComponent } from './organizer-page.component';
import SpyObj = jasmine.SpyObj;
class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }

    override disconnect() {
        // nothing
    }
}

class GamelogicserviceMock extends GameplayLogicService {
    currentQuestionIndex = 1;
}

class MatchServiceMock extends MatchHandlerService {
    accessCode: '5091';
    username: 'testname';
    isOrganizer: false;
    selectedGameId: '3';
    players = [
        {
            clientId: '3',
            username: 'jack',
            score: 1,
            bonusCount: 0,
            status: MatchPlayer.NO_TOUCH,
            lockedRoom: false,
        },
    ];
    bannedPlayers = [];
    game: Game = {
        id: '3',
        title: 'testtitle',
        description: 'description',
        duration: 10,
        questions: [
            {
                type: 'QCM',
                text: '',
                points: 0,
                choices: [
                    {
                        text: 'reponse vrai',
                        isCorrect: true,
                    },
                ],
            },
            {
                type: 'QRL',
                text: ';vn',
                points: 0,
            },
        ],
        lastModification: '',
    };
}
describe('OrganizerPageComponent', () => {
    let socketHelper: SocketTestHelper;
    let component: OrganizerPageComponent;
    let dialogRefAfterClosed: Subject<void>;
    let fixture: ComponentFixture<OrganizerPageComponent>;
    let socketServiceMock: SocketClientServiceMock;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let matchmock: MatchServiceMock;
    let gamelogicmock: GamelogicserviceMock;

    beforeEach(async () => {
        dialogRefAfterClosed = new Subject<void>();
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceMock.socket = socketHelper as any as Socket;
        matchmock = new MatchServiceMock(socketServiceMock, communicationServiceSpy);
        gamelogicmock = new GamelogicserviceMock(socketServiceMock, matchmock);
        TestBed.configureTestingModule({
            imports: [
                MatDialogModule,
                HttpClientModule,
                BrowserModule,
                RouterTestingModule,
                MatPaginatorModule,
                BrowserAnimationsModule,
                NgChartsModule,
                DialogModule,
            ],
            declarations: [OrganizerPageComponent, PlayersListComponent, ChatComponent, TransitionDialogComponent, AnswersGradingDialogComponent],
            providers: [
                { provide: CommunicationService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: MatchHandlerService, useValue: matchmock },
                { provide: GameplayLogicService, useValue: gamelogicmock },
                { provide: MatDialogRef, useValue: { afterClosed: () => dialogRefAfterClosed.asObservable() } },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(OrganizerPageComponent);
                component = fixture.componentInstance;
                fixture.detectChanges();
            });
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should modify histogram data when choosing correctly', () => {
        component.barChartData = {
            labels: [],
            datasets: [{ data: [], backgroundColor: [] }],
        };

        component.updateHistogram(0);
        expect(component.barChartData.labels).toEqual(['reponse vrai']);
        expect(component.barChartData.datasets[0].data).toEqual([0]);
        expect(component.barChartData.datasets[0].backgroundColor).toEqual(['green']);
    });

    it('should modify histogram data when choosing incorrectly', () => {
        component.barChartData = {
            labels: [],
            datasets: [{ data: [], backgroundColor: [] }],
        };

        // component["matchHandler"].questionHistograms=[[0,1], [1,1]]
        component.updateHistogram(1);
        expect(component.barChartData.labels).toEqual(['A interagi', "N'a pas interagi"]);
        expect(component.barChartData.datasets[0].data).toEqual([0, 0]);
        expect(component.barChartData.datasets[0].backgroundColor).toEqual(['green', 'red']);
    });

    it(' should check if we are at the last question', () => {
        component.gameLogicService.currentQuestionIndex = 2;
        expect(component.isLastQuestion()).toEqual(true);
    });

    it('should check if we are not at the last question', () => {
        expect(component.isLastQuestion()).toEqual(false);
    });

    it('should move to results page if it s the last question', () => {
        component.gameLogicService.currentQuestionIndex = 3;
        const spy = spyOn(component['socketService'], 'send');
        const spyDialog = spyOn(component['dialog'], 'closeAll');
        const eventName = MatchEvents.ShowResults;
        component.matchHandler.accessCode = '5826';
        const testString = component.matchHandler.accessCode;

        component.goNext();
        expect(spy).toHaveBeenCalledWith(eventName, testString);
        expect(component.gameLogicService.isGameOver).toBeTruthy();
        expect(spyDialog).toHaveBeenCalled();
    });

    it('should startGrading', fakeAsync(() => {
        const spy = spyOn(component['socketService'], 'send');
        // const spyDialog = spyOn(component['dialog'], 'closeAll');
        const eventName = MatchEvents.GradingFinished;
        component.matchHandler.accessCode = '5826';

        const mockQuestion: { [clientId: string]: QrlAnswer } = {
            yo: {
                username: 'yo',
                answer: 'done',
                grade: 10,
            },
            name: {
                username: 'name',
                answer: 'no done',
                grade: 20,
            },
        };
        tick();
        const spyDialog = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => of(sortedQRLAnswers),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as MatDialogRef<any, any>);
        const sortedQRLAnswers = {
            clientId2: { username: 'name', answer: 'no done', grade: 20 },
            clientId1: { username: 'yo', answer: 'done', grade: 10 },
        };

        const code = component.matchHandler.accessCode;
        const testString = { accessCode: code, qRLAnswers: sortedQRLAnswers };

        component.startGrading(mockQuestion);
        // expect(spy).toHaveBeenCalled()
        expect(spy).toHaveBeenCalledWith(eventName, testString);
        expect(spyDialog).toHaveBeenCalled();
    }));

    it('should changetimerstate', () => {
        const spy = spyOn(component['socketService'], 'send');

        const eventName = MatchEvents.ChangeTimerState;
        component.matchHandler.accessCode = '5826';
        const newState = component.timerState.RUNNING;
        const testString = { accessCode: component.matchHandler.accessCode, timerState: newState };

        component.changeTimerState(newState);
        expect(spy).toHaveBeenCalledWith(eventName, testString);
    });

    it('should move on to the next question if it s not the last one', fakeAsync(() => {
        spyOn(component, 'isLastQuestion').and.returnValue(false);
        const spy = spyOn(component['socketService'], 'send');
        const spyupdate = spyOn(component, 'updateHistogram');
        const eventName = MatchEvents.NextQuestion;
        component.matchHandler.accessCode = '5826';
        const testString = component.matchHandler.accessCode;

        const spyDialog = spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => dialogRefAfterClosed.asObservable(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as MatDialogRef<any, any>);
        component.goNext();
        dialogRefAfterClosed.next();
        expect(spy).toHaveBeenCalledWith(eventName, testString);
        expect(spyDialog).toHaveBeenCalledWith(TransitionDialogComponent, {
            data: { message: 'Question suivante dans', duration: 3 },
            disableClose: true,
        });

        const transitionDialog = component['dialog'].open(TransitionDialogComponent, {
            data: { message: 'Question suivante dans', duration: 3 },
            disableClose: true,
        });

        transitionDialog.afterClosed().subscribe({
            next: () => {
                expect(component.gameLogicService.currentQuestionIndex).toEqual(2);
                expect(spyupdate).toHaveBeenCalled();
            },
        });
        discardPeriodicTasks();
    }));

    it('should send an alert if there is an error', () => {
        const spyalert = spyOn(window, 'alert');
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('Error', 'erreur');
        expect(spyalert).toHaveBeenCalledWith('erreur');
    });

    it('should send the list of results from socket to all players in the game', () => {
        const initPlayers: Player[] = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        component.matchHandler.players = initPlayers;
        const updatedPlayers: Player[] = [
            {
                clientId: '3',
                username: 'jack',
                score: 1,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit('allPlayersResults', updatedPlayers);
        expect(component.matchHandler.players[0].score).toEqual(1);
        expect(component.usersAnswersSubmitted).toBeTruthy();
    });

    it('should select user choice', () => {
        component.configureBaseSocketFeatures();
        component.barChartData = {
            labels: [],
            datasets: [{ data: [0], backgroundColor: [] }],
        };
        socketHelper.peerSideEmit('answerSelected', 1);
        expect(component.barChartData.datasets[0].data).toEqual([0, 2]);
    });

    it('should unselect user choice', () => {
        component.configureBaseSocketFeatures();
        component.barChartData = {
            labels: [],
            datasets: [{ data: [0, 2], backgroundColor: [] }],
        };

        socketHelper.peerSideEmit('answerUnselected', 1);
        expect(component.barChartData.datasets[0].data).toEqual([0, 0]);
    });

    it('should on QRLInteractionData ', () => {
        component.configureBaseSocketFeatures();
        component.barChartData = {
            labels: [],
            datasets: [{ data: [0, 2], backgroundColor: [] }],
        };

        socketHelper.peerSideEmit('QRLInteractionData', 1);
        expect(component.barChartData.datasets[0].data).toEqual([1, 0]);
    });

    it('should unselect user choice invisible', () => {
        component.configureBaseSocketFeatures();
        component.barChartData = {
            labels: [],
            datasets: [{ data: [0, 2], backgroundColor: [] }],
        };

        socketHelper.peerSideEmit('answerUnselected', 2);
        expect(component.barChartData.datasets[0].data).toEqual([0, 2, 0]);
    });
    it('should disconnect from the socket and navigate to home page', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        const spyDisconnect = spyOn(component['socketService'], 'disconnect');

        component.giveUp();
        expect(spyDisconnect).toHaveBeenCalled();

        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    }));

    it('should timerestantqcm', () => {
        const REMAINING_TIME_QCM = 10;
        component.currentQuestion.type = 'QCM';

        expect(component.remainingTime()).toEqual(REMAINING_TIME_QCM);
    });

    it('should timerestant QRL', () => {
        const REMAINING_TIME_QRL = 20;
        component.currentQuestion.type = 'QRL';

        expect(component.remainingTime()).toEqual(REMAINING_TIME_QRL);
    });
});
