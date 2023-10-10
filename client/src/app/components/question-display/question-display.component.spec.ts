import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { QuestionDisplayComponent } from './question-display.component';

const MS = 1000;

describe('QuestionDisplayComponent', () => {
    let component: QuestionDisplayComponent;
    let fixture: ComponentFixture<QuestionDisplayComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            declarations: [QuestionDisplayComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(QuestionDisplayComponent);
                component = fixture.componentInstance;

                component.currentQuestion = {
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
                };
                component.questionTime = 15;
                component.autoSubmitEnabled = false;
                fixture.detectChanges();
            });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call the start timer', fakeAsync(() => {
        const spy = spyOn(component, 'startTimer');
        component.resetTimer();
        expect(spy).toHaveBeenCalled();
        flush();
    }));

    it('should should call the clearTimeout', fakeAsync(() => {
        const spy = spyOn(window, 'clearTimeout');
        component.timer = setTimeout(() => '', component.questionTime);
        component.resetTimer();
        expect(spy).toHaveBeenCalled();
        flush();
    }));
    it('should not call the clearTimeout ', fakeAsync(() => {
        const spy = spyOn(window, 'clearTimeout');
        component.resetTimer();
        expect(spy).not.toHaveBeenCalled();
        flush();
    }));

    it('should call the settimeout ', fakeAsync(() => {
        const spy = spyOn(window, 'setTimeout');
        component.startTimer();
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));
    it('should should call the submitaswnser at the end of the timer', fakeAsync(() => {
        const spy = spyOn(component, 'submitAnswers');
        component.startTimer();
        tick(component.questionTime * MS);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should should call the emit', fakeAsync(() => {
        const spy2 = spyOn(component.answersSubmitted, 'emit');
        component.submitAnswers();
        expect(spy2).toHaveBeenCalled();
        discardPeriodicTasks();
    }));
    it('should should call the validateAnswers ', fakeAsync(() => {
        const spy2 = spyOn(component, 'validateAnswers');
        component.submitAnswers();
        expect(spy2).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should make the validate function work', fakeAsync(() => {
        expect(component.isSubmitted).toEqual(false);
        component.validateAnswers();
        expect(component.isSubmitted).toEqual(true);
    }));

    it('should give the correct value to selected', fakeAsync(() => {
        component.selectedAnswerIndexes = [1, 2];
        expect(component.isSelected(1)).toBeTrue();
    }));

    it('should give the bad value to selected', fakeAsync(() => {
        component.selectedAnswerIndexes = [1, 2];
        expect(component.isSelected(3)).toBeFalse();
    }));

    it('should put index in answer choices', fakeAsync(() => {
        component.selectedAnswerIndexes = [1, 2];
        expect(component.selectedAnswerIndexes[0]).toEqual(1);
        component.toggleChoice(1);
        expect(component.selectedAnswerIndexes[0]).toEqual(2);
    }));

    it('should not put index in the answer choices', fakeAsync(() => {
        component.selectedAnswerIndexes = [1, 2];
        expect(component.selectedAnswerIndexes[0]).toEqual(1);
        component.toggleChoice(3);
        expect(component.selectedAnswerIndexes.length).toEqual(3);
    }));

    it('should select the correct digit on the keyboard representing the answer number', fakeAsync(() => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', { key: '1' });
        const spy = spyOn(component, 'toggleChoice');
        component.handleKeyboardEvent(event);
        expect(spy).toHaveBeenCalled();
    }));

    it('should not select the correct digit on the keyboard representing the answer number ', fakeAsync(() => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', { key: '3' });
        const spy = spyOn(component, 'toggleChoice');
        component.handleKeyboardEvent(event);
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should select the Enter button ', fakeAsync(() => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        const spy = spyOn(component, 'submitAnswers');
        component.handleKeyboardEvent(event);
        expect(spy).toHaveBeenCalled();
    }));

    it('should check if resetTimerSpy was called in ngOnChanges lifecycle hook', () => {
        component.isSubmitted = true;
        component.selectedAnswerIndexes = [1, 2];
        const resetTimerSpy = spyOn(component, 'resetTimer');
        component.ngOnChanges();
        expect(component.isSubmitted).toEqual(false);
        expect(component.selectedAnswerIndexes).toEqual([]);
        expect(resetTimerSpy).toHaveBeenCalled();
    });
});
