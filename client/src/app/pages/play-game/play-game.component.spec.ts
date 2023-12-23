/* eslint-disable max-lines */
// eslint-disable-next-line max-classes-per-file
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatComponent } from '@app/components/chat/chat.component';
import { QuestionDisplayComponent } from '@app/components/question-display/question-display.component';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { TransitionDialogComponent } from '@app/components/transition-dialog/transition-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameTestLogicService } from '@app/services/game.test.logic.service';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { BaseQuestion, Game, MatchPlayer, Player, PlayerResult } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { Subject, of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { PlayGameComponent } from './play-game.component';
import SpyObj = jasmine.SpyObj;
//   const TIME = 10;
//  const SCORE = 12;

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

const dummyQuestions: BaseQuestion[] = [
    {
        type: 'QCM',
        text: 'question1',
        points: 10,
    },
    {
        type: 'QRL',
        text: 'question2',
        points: 10,
    },
];

const dummmyGame: Game = {
    id: '1',
    title: 'game1',
    description: 'game1',
    questions: dummyQuestions,
    duration: 10,
    lastModification: '',
};

class MatchServiceMock extends MatchHandlerService {
    accessCode: '5091';
    username: 'testname';
    isOrganizer: false;
    selectedGameId: '3';
    players = [];
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

describe('PlayGameComponent', () => {
    let socketServiceMock: SocketClientServiceMock;
    let component: PlayGameComponent;
    let socketHelper: SocketTestHelper;
    let matchmock: MatchServiceMock;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    //  let communicationService: CommunicationService;

    //  let dialog: MatDialog;
    let dialogRefAfterClosed: Subject<void>;
    let gamelogicmock: GamelogicserviceMock;
    beforeEach(async () => {
        socketServiceMock = new SocketClientServiceMock();
        dialogRefAfterClosed = new Subject<void>();
        socketHelper = new SocketTestHelper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceMock.socket = socketHelper as any as Socket;
        matchmock = new MatchServiceMock(socketServiceMock, communicationServiceSpy);

        gamelogicmock = new GamelogicserviceMock(socketServiceMock, matchmock);
        TestBed.configureTestingModule({
            declarations: [PlayGameComponent, QuestionDisplayComponent, ChatComponent],
            imports: [
                RouterTestingModule,
                MatDialogModule,
                HttpClientTestingModule,
                FormsModule,
                ReactiveFormsModule,
                MatProgressBarModule,
                MatCardModule,
                MatGridListModule,
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
                { provide: CommunicationService },
                { provide: GameTestLogicService },
                { provide: GameplayLogicService, useValue: gamelogicmock },
                { provide: MatchHandlerService, useValue: matchmock },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: MatDialogRef, useValue: { afterClosed: () => dialogRefAfterClosed.asObservable() } },
            ],
        }).compileComponents();
        //  communicationService = TestBed.inject(CommunicationService);
        //  gameTestLogicService = TestBed.inject(GameTestLogicService);
        //  spyOn(communicationService, 'getGameById').and.returnValue(of(dummmyGame));
        //  spyOn(gameTestLogicService, 'start').and.callThrough();
        //  spyOn(gameTestLogicService, 'reset').and.callThrough();
        //  spyOn(gameTestLogicService, 'stop').and.callThrough();
        //  spyOn(dialog, 'open').and.returnValue({
        //      afterClosed: () => dialogRefAfterClosed.asObservable(),
        //  } as MatDialogRef<any, any>);
        //  spyOn(dialog, 'closeAll').and.callThrough();
        // dialog = TestBed.inject(MatDialog);
    });

    beforeEach(() => {
        const fixture = TestBed.createComponent(PlayGameComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize game on ngOnInit', () => {
        const spystart = spyOn(gamelogicmock, 'start').and.callThrough();
        const spyconfigure = spyOn(component, 'configureBaseSocketFeatures').and.callThrough();
        component.ngOnInit();
        expect(component.isDataLoaded).toBeTrue();
        expect(spystart).toHaveBeenCalledWith();
        expect(spyconfigure).toHaveBeenCalledWith();
    });

    it('should stop game logic service on ngOnDestroy', () => {
        const spystop = spyOn(component, 'abandonGame').and.callThrough();
        component.gameLogicService.isGameOver = false;
        component.ngOnDestroy();
        expect(spystop).toHaveBeenCalled();
    });

    it('should showresult', () => {
        const spyclose = spyOn(component['dialog'], 'closeAll').and.callThrough();
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
        component.gameLogicService.isGameOver = false;
        component.showResults(player);
        expect(spyclose).toHaveBeenCalled();
        expect(component.matchHandler.players).toEqual(player);
        expect(component.gameLogicService.isGameOver).toBeTruthy();
    });

    it('should configureBaseSocketFeatures MatchEvents.PlayerResult', () => {
        const playerresult: PlayerResult = {
            score: 0,
            isCorrect: true,
            hasBonus: true,
            correctChoices: [1, 2],
        };
        const spyhandle = spyOn(component, 'handlePlayerResult').and.callThrough();
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.PlayerResult, playerresult);
        expect(spyhandle).toHaveBeenCalled();
    });

    it('should configureBaseSocketFeatures MatchEvents.nexquestion', () => {
        const index = 0;
        const spymove = spyOn(component, 'moveToNextQuestion').and.callThrough();
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.NextQuestion, index);
        expect(spymove).toHaveBeenCalled();
    });

    it('should configureBaseSocketFeatures MatchEvents.OrganizerLeft', () => {
        const spyend = spyOn(component, 'endGame').and.callThrough();
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.OrganizerLeft);
        expect(spyend).toHaveBeenCalled();
    });

    it('should configureBaseSocketFeatures MatchEvents.PlayerResult', () => {
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
        const spyshow = spyOn(component, 'showResults').and.callThrough();
        component.configureBaseSocketFeatures();
        socketHelper.peerSideEmit(MatchEvents.FinalResults, player);
        expect(spyshow).toHaveBeenCalled();
    });

    it('should move to the next question on correct answer and open dialog', () => {
        component.matchHandler.game = dummmyGame;

        const spydialog = spyOn(component['dialog'], 'open').and.callThrough();
        //  spyOn(component['gameTestLogicService'], 'verifyQuestion').and.returnValue({ isCorrect: true, correctChoices: [] });
        //    const spy= spyOn(component['dialog'], 'open').and.returnValue({
        //         afterClosed: () => dialogRefAfterClosed.asObservable(),

        //     } as MatDialogRef<any, any>);
        component.gameLogicService.currentQuestionIndex = 0;
        component.moveToNextQuestion(1);

        expect(spydialog).toHaveBeenCalledWith(TransitionDialogComponent, {
            data: { message: 'Question suivante dans', duration: 3 },
            disableClose: true,
        });

        const transitionDialog = component['dialog'].open(TransitionDialogComponent, { data: { message: 'Question suivante dans', duration: 3 } });

        transitionDialog.afterClosed().subscribe({
            next: () => {
                expect(component.gameLogicService.currentQuestionIndex).toEqual(1);
            },
            error: fail,
        });
        //  expect(component.gameLogicService.currentQuestionIndex).toEqual(1)
        // expect(gameTestLogicService.reset).toHaveBeenCalled();
        //      expect(component.score).toEqual(SCORE);
    });

    it('should show the modal for those who found the question with bonus', () => {
        const playerresult: PlayerResult = {
            score: 0,
            isCorrect: true,
            hasBonus: true,
            correctChoices: [1, 2],
        };
        const spydialog = spyOn(component['dialog'], 'open');
        component.handlePlayerResult(playerresult);

        expect(spydialog).toHaveBeenCalledWith(QuestionResultDialogComponent, {
            data: { correctChoices: [], message: 'Correct! Vous avez reçu un bonus de 20%', isCorrect: true },
        });
    });

    it('should show the modal for those who found the question without bonus', () => {
        const playerresult: PlayerResult = {
            score: 0,
            isCorrect: true,
            hasBonus: false,
            correctChoices: [1, 2],
        };
        const spydialog = spyOn(component['dialog'], 'open');
        component.handlePlayerResult(playerresult);

        expect(spydialog).toHaveBeenCalledWith(QuestionResultDialogComponent, {
            data: { correctChoices: [], message: 'Correct!', isCorrect: true },
        });
    });

    it('should show the modal for those who not found the question without bonus', () => {
        component.matchHandler.game.questions = [
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
                type: 'QCM',
                text: ';vn',
                points: 0,
                choices: [
                    {
                        text: 'reponse fausse',
                        isCorrect: false,
                    },
                ],
            },
        ];

        component.gameLogicService.currentQuestionIndex = 2;
        component.matchHandler.game.questions = [
            {
                type: 'QCM',
                text: 'What is the capital of France?',
                points: 10,
                choices: [
                    {
                        text: 'Choice 1.1',
                        isCorrect: true,
                    },
                    {
                        text: 'Choice 1.2',
                        isCorrect: false,
                    },
                ],
            },
        ];

        component.gameLogicService.currentQuestionIndex = 0;

        const playerresult: PlayerResult = {
            score: 0,
            isCorrect: false,
            hasBonus: false,
            correctChoices: [0],
        };
        spyOn(component['dialog'], 'open').and.returnValue({
            afterClosed: () => dialogRefAfterClosed.asObservable(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as MatDialogRef<any, any>);

        component.handlePlayerResult(playerresult);

        expect(component['dialog'].open).toHaveBeenCalledWith(QuestionResultDialogComponent, {
            data: {
                correctChoices: [
                    {
                        text: 'Choice 1.1',
                        isCorrect: true,
                    },
                ],
                message: 'Incorrect, La bonne réponse est: Choice 1.1',
                isCorrect: false,
            },
        });
    });

    it('should send a socket event for users who abandon the game', () => {
        const spy = spyOn(component['socketService'], 'send');
        const eventName = MatchEvents.LeaveGame;
        component.matchHandler.accessCode = '5826';
        const testString = component.matchHandler.accessCode;
        const spyend = spyOn(component, 'endGame');
        component.abandonGame();
        expect(spy).toHaveBeenCalledWith(eventName, testString);
        expect(spyend).toHaveBeenCalled();
    });

    it('should send a socket event for response submissions', () => {
        const spy = spyOn(component['socketService'], 'send');
        const eventName = MatchEvents.SubmitAnswers;
        component.matchHandler.accessCode = '5826';
        const testString = { accessCode: component.matchHandler.accessCode, answer: [0, 1] };
        component.submitAnswers([0, 1]);
        expect(spy).toHaveBeenCalledWith(eventName, testString);
    });

    it('should focus on the game and not the chat', () => {
        component.isChatFocused = false;
        component.isGameFocused = true;
        component.setFocusOnChat();
        expect(component.isChatFocused).toBeTruthy();
        expect(component.isGameFocused).toBeFalsy();
    });

    it(' should focus on the chat and not the game', () => {
        component.isGameFocused = false;
        component.isChatFocused = true;
        component.setFocusOnGame();
        expect(component.isGameFocused).toBeTruthy();
        expect(component.isChatFocused).toBeFalsy();
    });
});
