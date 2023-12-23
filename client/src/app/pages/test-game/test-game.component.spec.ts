import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameTestLogicService } from '@app/services/game.test.logic.service';
import { Game, Question } from '@common/definitions';
import { Subject, of } from 'rxjs';
import { TestGameComponent } from './test-game.component';

const MS = 3000;
const SCORE = 12;
const TIME = 10;

const dummyQuestions: Question[] = [
    {
        type: 'QCM',
        text: 'question1',
        points: 10,
        choices: [
            { text: 'choice1', isCorrect: true },
            { text: 'choice2', isCorrect: false },
        ],
    },
    {
        type: 'QRL',
        text: 'question2',
        points: 10,
    },
    {
        type: 'QCM',
        text: 'question3',
        points: 10,
        choices: [
            { text: 'choice5', isCorrect: true },
            { text: 'choice6', isCorrect: false },
        ],
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

describe('TestGameComponent', () => {
    let component: TestGameComponent;
    let fixture: ComponentFixture<TestGameComponent>;
    let communicationService: CommunicationService;
    let gameLogicService: GameTestLogicService;
    let dialog: MatDialog;
    let dialogRefAfterClosed: Subject<void>;

    beforeEach(async () => {
        dialogRefAfterClosed = new Subject<void>();

        TestBed.configureTestingModule({
            declarations: [TestGameComponent],
            imports: [RouterTestingModule, MatDialogModule, HttpClientTestingModule, MatCardModule, MatDialogModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
                CommunicationService,
                GameTestLogicService,
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TestGameComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        gameLogicService = TestBed.inject(GameTestLogicService);
        dialog = TestBed.inject(MatDialog);

        spyOn(communicationService, 'getGameById').and.returnValue(of(dummmyGame));
        spyOn(gameLogicService, 'start').and.callThrough();
        spyOn(gameLogicService, 'reset').and.callThrough();
        spyOn(gameLogicService, 'stop').and.callThrough();
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => dialogRefAfterClosed.asObservable(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as MatDialogRef<any, any>);
        spyOn(dialog, 'closeAll').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize game on ngOnInit', () => {
        component.ngOnInit();
        expect(communicationService.getGameById).toHaveBeenCalledWith('1');
        expect(component.isDataLoaded).toBeTrue();
        expect(gameLogicService.start).toHaveBeenCalledWith(TIME);
    });

    it('should stop game logic service on ngOnDestroy', () => {
        component.ngOnDestroy();
        expect(gameLogicService.stop).toHaveBeenCalled();
    });

    it('should move to the next question on correct answer and open dialog', () => {
        component.game = dummmyGame;
        spyOn(gameLogicService, 'verifyQuestion').and.returnValue({ isCorrect: true, correctChoices: [] });

        component.currentQuestionIndex = 0;
        component.moveToNextQuestion([0]);

        expect(dialog.open).toHaveBeenCalledWith(QuestionResultDialogComponent, {
            data: { correctChoices: [], message: 'Correct! Vous avez reçu un bonus de 20%', isCorrect: true },
        });
        expect(component.score).toEqual(SCORE);
    });

    it('should move to the next question on incorrectcorrect answer and open dialog', () => {
        component.game = dummmyGame;
        spyOn(gameLogicService, 'verifyQuestion').and.returnValue({ isCorrect: false, correctChoices: [0] });

        component.currentQuestionIndex = 0;
        component.moveToNextQuestion([0]);

        expect(dialog.open).toHaveBeenCalledWith(QuestionResultDialogComponent, {
            data: { correctChoices: [0], message: 'Incorrect! La bonne réponse est: choice1', isCorrect: false },
        });
        expect(component.score).toEqual(0);
    });

    it('should end game if it was the last question', fakeAsync(() => {
        component.game = dummmyGame;
        spyOn(gameLogicService, 'verifyQuestion').and.returnValue({ isCorrect: true, correctChoices: [] });
        const endGameSpy = spyOn(component, 'endGame');

        component.currentQuestionIndex = 1;
        component.moveToNextQuestion([0]);

        tick(MS);

        expect(component.currentQuestionIndex).toEqual(2);

        component.moveToNextQuestion([0]);

        tick(MS);

        expect(endGameSpy).toHaveBeenCalled();
    }));

    it('should abandon game and navigate back to home', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        component.abandonGame();

        expect(gameLogicService.stop).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/games']);
    }));

    it('should end game and navigate back to home', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        component.endGame();
        dialogRefAfterClosed.next();

        expect(gameLogicService.stop).toHaveBeenCalled();
        expect(navigateSpy).toHaveBeenCalledWith(['/games']);
    }));
});
