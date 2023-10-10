import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionDialogComponent } from './question-dialog.component';

const ARRAYFILL = 4;

describe('QuestionDialogComponent', () => {
    let component: QuestionDialogComponent;
    let fixture: ComponentFixture<QuestionDialogComponent>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    const mockQuestion = {
        text: 'Test',
        points: 10,
        choices: [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ],
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, FormsModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSlideToggleModule],
            declarations: [QuestionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockQuestion },
            ],
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
        component.question.choices = [{ text: 'Choice', isCorrect: false }];
        const initialLength = component.question.choices.length;
        component.addChoice();
        expect(component.question.choices.length).toBe(initialLength + 1);
    });

    it('should remove a choice', () => {
        component.question.choices = [{ text: 'Choice', isCorrect: false }];
        const initialLength = component.question.choices.length;
        component.removeChoice(0);
        expect(component.question.choices.length).toBe(initialLength - 1);
    });

    it('should not add a choice when reaching MAX_CHOICES', () => {
        component.question.choices = new Array(ARRAYFILL).fill({ text: 'Choice', isCorrect: false });
        component.addChoice();
        expect(component.question.choices.length).toBe(ARRAYFILL);
    });

    it('should move choice up', () => {
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: false },
        ];
        component.moveChoiceUp(1);
        expect(component.question.choices[0]).toEqual({ text: 'Choice 2', isCorrect: true });
        expect(component.question.choices[1]).toEqual({ text: 'Choice 1', isCorrect: false });
    });

    it('should move choice down', () => {
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
            { text: 'Choice 3', isCorrect: false },
        ];
        component.moveChoiceDown(1);
        expect(component.question.choices[1]).toEqual({ text: 'Choice 3', isCorrect: false });
        expect(component.question.choices[2]).toEqual({ text: 'Choice 2', isCorrect: true });
    });

    it('should not move choice up when it is the first choice', () => {
        const firstChoice = component.question.choices[0];
        component.moveChoiceUp(0);
        expect(component.question.choices[0]).toBe(firstChoice);
    });

    it('should not move choice down when it is the last choice', () => {
        const lastChoice = component.question.choices[component.question.choices.length - 1];
        component.moveChoiceDown(component.question.choices.length - 1);
        expect(component.question.choices[component.question.choices.length - 1]).toBe(lastChoice);
    });

    it('should validate form correctly', () => {
        component.question = {
            text: 'Test',
            points: 10,
            choices: [
                { text: 'Choice 1', isCorrect: true },
                { text: 'Choice 2', isCorrect: false },
            ],
        };
        expect(component.isFormValid()).toBeTruthy();
    });

    it('should invalidate form when text is empty', () => {
        component.question.text = '';
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when points is out of range', () => {
        component.question.points = 105;
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when points is not a multiple of POINTS_STEP', () => {
        component.question.points = 15;
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when there are not enough correct choices', () => {
        component.question.choices = [
            { text: 'Choice 1', isCorrect: false },
            { text: 'Choice 2', isCorrect: false },
        ];
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should invalidate form when there are not enough filled choices', () => {
        component.question.choices = [
            { text: '', isCorrect: false },
            { text: 'Choice 2', isCorrect: true },
        ];
        expect(component.isFormValid()).toBeFalsy();
    });

    it('should correctly set question from MAT_DIALOG_DATA', () => {
        expect(component.question).toEqual(mockQuestion);
    });

    it('should initialize a default question when MAT_DIALOG_DATA is null', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, FormsModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSlideToggleModule],
            declarations: [QuestionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: null },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        expect(component.question.choices.length).toBe(2);
    });
});
