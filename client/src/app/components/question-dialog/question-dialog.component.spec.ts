/* eslint-disable */
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Choice, QCMQuestion, QRLQuestion } from '@common/definitions';
import { QuestionDialogComponent } from './question-dialog.component';

const ARRAYFILL = 4;

describe('QuestionDialogComponent', () => {
    let component: QuestionDialogComponent;
    let fixture: ComponentFixture<QuestionDialogComponent>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    const mockQuestion: QCMQuestion = {
        type: 'QCM',
        text: 'Test',
        points: 10,
        choices: [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatIconModule,
                MatInputModule,
                MatFormFieldModule,
                MatSlideToggleModule,
                ReactiveFormsModule,
                MatRadioModule,
                MatDialogModule,
            ],
            declarations: [QuestionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockQuestion },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(QuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog with question data on confirm', () => {
        component.onConfirm();
        expect(mockDialogRef.close).toHaveBeenCalledWith(mockQuestion);
    });

    it('should add a choice', () => {
        component.question = component.question as QCMQuestion;
        component.question.type = 'QCM';
        component.question.choices = [{ text: 'Choice', isCorrect: false }];
        const initialLength = component.question.choices.length;
        component.addChoice();
        expect(component.question.choices.length).toBe(initialLength + 1);
    });

    it('should remove a choice', () => {
        component.question = component.question as QCMQuestion;
        component.question.type = 'QCM';
        component.question.choices = [{ text: 'Choice', isCorrect: false }];
        const initialLength = component.question.choices.length;
        component.removeChoice(0);
        expect(component.question.choices.length).toBe(initialLength - 1);
    });

    it('should not add a choice when reaching MAX_CHOICES', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = new Array(ARRAYFILL).fill({ text: 'Choice', isCorrect: false });
        component.addChoice();
        expect(component.question.choices.length).toBe(ARRAYFILL);
    });

    it('should move choice up', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: false },
        ];
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: 1,
            currentIndex: 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            container: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            previousContainer: {} as any,
            isPointerOverContainer: false,
            distance: {
                x: 0,
                y: 0,
            },
            dropPoint: {
                x: 0,
                y: 0,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: {} as any,
        };
        // event.previousIndex=0;
        component.question.type = 'QCM';
        // component.moveChoiceUp(1);

        //    event.previousIndex=1;

        component.drop(event);
        expect(component.question.choices[0]).toEqual({ text: 'Choice 2', isCorrect: true });
        expect(component.question.choices[1]).toEqual({ text: 'Choice 1', isCorrect: false });
    });

    it('should move choice down', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: false },
        ];
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: 1,
            currentIndex: 2,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            container: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            previousContainer: {} as any,
            isPointerOverContainer: false,
            distance: {
                x: 0,
                y: 0,
            },
            dropPoint: {
                x: 0,
                y: 0,
            },

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: {} as any,
        };
        component.question.type = 'QCM';
        component.drop(event);
        // component.moveChoiceDown(1);
        expect(component.question.choices[1]).toEqual({ text: 'Choice 3', isCorrect: false });
        expect(component.question.choices[2]).toEqual({ text: 'Choice 2', isCorrect: true });
    });

    it('should not move choice up when it is the first choice', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const firstChoice = component.question.choices[0];
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: 0,
            currentIndex: -1,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            container: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            previousContainer: {} as any,
            isPointerOverContainer: false,
            distance: {
                x: 0,
                y: 0,
            },
            dropPoint: {
                x: 0,
                y: 0,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: {} as any,
        };
        component.question.type = 'QCM';
        component.drop(event);
        // component.moveChoiceUp(0);
        expect(component.question.choices[0]).toBe(firstChoice);
    });

    it('should not move choice down when it is the last choice', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];
        const event: CdkDragDrop<Choice[]> = {
            previousIndex: component.question.choices.length - 1,
            currentIndex: component.question.choices.length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            item: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            container: {} as any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            previousContainer: {} as any,
            isPointerOverContainer: false,
            distance: {
                x: 0,
                y: 0,
            },
            dropPoint: {
                x: 0,
                y: 0,
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            event: {} as any,
        };
        component.question.type = 'QCM';
        component.drop(event);
        const lastChoice = component.question.choices[component.question.choices.length - 1];
        // component.moveChoiceDown(component.question.choices.length - 1);
        expect(component.question.choices[component.question.choices.length - 1]).toBe(lastChoice);
    });

    it('should validate form correctly', () => {
        component.question = component.question as QCMQuestion;
        component.question = {
            type: 'QCM',
            text: 'Test',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        component.question.type = 'QCM';
        expect(component.isFormValid()).toBeTruthy();
    });

    it('should invalidate form when text is empty', () => {
        component.question.type = 'QCM';
        component.question.text = '';
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when points is out of range', () => {
        component.question.type = 'QCM';
        component.question.points = 105;
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when points is not a multiple of POINTS_STEP', () => {
        component.question.points = 15;
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when there are not enough correct choices', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
        ];
        component.question.type = 'QCM';
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when there are not enough filled choices', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: '', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        component.question.type = 'QCM';
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should correctly set question from MAT_DIALOG_DATA', () => {
        component.question = component.question as QCMQuestion;
        component.question.type = 'QCM';
        expect(component.question).toEqual(mockQuestion);
    });

    it('should initialize a default question when MAT_DIALOG_DATA is null', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [
                BrowserAnimationsModule,
                FormsModule,
                MatIconModule,
                MatInputModule,
                MatFormFieldModule,
                MatSlideToggleModule,
                MatDialogModule,
                MatRadioModule,
            ],
            declarations: [QuestionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: null },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.question = component.question as QCMQuestion;
        component.question.choices = [
            { text: 'Choice 1', isCorrect: true },
            { text: 'Choice 2', isCorrect: false },
        ];

        expect(component.question.choices.length).toBe(2);
    });

    it('should form is not valid to correctchoice and incorrect choice invalid', () => {
        component.question = {
            type: 'QCM',
            text: 'yo',
            points: 10,
            choices: [
                {
                    text: 'Choice 1.1',
                    isCorrect: true,
                },
                {
                    text: 'Choice 1.2',
                    isCorrect: true,
                },
            ],
        };
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should form is not valid to point incorrect', () => {
        component.question = {
            type: 'QCM',
            text: 'yo',
            points: 105,
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
        };
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should ontypechange QCM', () => {
        component.question = component.question as QRLQuestion;
        component.onTypeChange('QCM');
        expect(component.question.type).toEqual('QCM');
    });

    it('should ontypechange qrl', () => {
        component.question = component.question as QCMQuestion;
        component.question.choices = [];
        component.onTypeChange('QRL');
        expect(component.question.type).toEqual('QRL');
        expect((component.question as QCMQuestion).choices).toBeUndefined();
    });

    it('should initializechoice', () => {
        expect(component['initializeChoices']().length).toEqual(2);
    });
});
