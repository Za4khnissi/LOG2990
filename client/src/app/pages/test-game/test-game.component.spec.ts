import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { Game, Question } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameLogicService } from '@app/services/game-logic.service';
import { Subject, of } from 'rxjs';
import { TestGameComponent } from './test-game.component';

const MS = 3000;
const SCORE = 12;
const TIME = 10;

const dummyQuestions: Question[] = [
    {
        text: 'question1',
        points: 10,
        choices: [
            { text: 'choice1', isCorrect: true },
            { text: 'choice2', isCorrect: false },
        ],
    },
    {
        text: 'question2',
        points: 10,
        choices: [
            { text: 'choice3', isCorrect: true },
            { text: 'choice4', isCorrect: false },
        ],
    },
    {
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
    let gameLogicService: GameLogicService;
    let dialog: MatDialog;
    let dialogRefAfterClosed: Subject<void>;

    beforeEach(async () => {
        dialogRefAfterClosed = new Subject<void>();

        TestBed.configureTestingModule({
            declarations: [TestGameComponent],
            imports: [RouterTestingModule, MatDialogModule, HttpClientTestingModule],
            providers: [
                { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
                CommunicationService,
                GameLogicService,
                { provide: MatDialogRef, useValue: {} },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(TestGameComponent);
        component = fixture.componentInstance;
        communicationService = TestBed.inject(CommunicationService);
        gameLogicService = TestBed.inject(GameLogicService);
        dialog = TestBed.inject(MatDialog);

        spyOn(communicationService, 'getGameById').and.returnValue(of(dummmyGame));
        spyOn(gameLogicService, 'start').and.callThrough();
        spyOn(gameLogicService, 'reset').and.callThrough();
        spyOn(gameLogicService, 'stop').and.callThrough();
        spyOn(dialog, 'open').and.returnValue({
            afterClosed: () => dialogRefAfterClosed.asObservable(),
        } as MatDialogRef<unknown, unknown>);
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
            data: { correctChoices: [], bonusMessage: 'Correct! Vous avez reçu un bonus de 20%' },
        });
        expect(component.score).toEqual(SCORE);
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
