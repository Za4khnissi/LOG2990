import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommunicationService } from '@app/services/communication.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { MatchEvents } from '@common/socket.events';
import { QuestionDisplayComponent } from './question-display.component';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }
}
// const MS = 1000;

describe('QuestionDisplayComponent', () => {
    let socketServiceMock: SocketClientServiceMock;
    let component: QuestionDisplayComponent;
    let fixture: ComponentFixture<QuestionDisplayComponent>;
    let matchHandlerServiceStub: jasmine.SpyObj<MatchHandlerService>;
    beforeEach(async () => {
        socketServiceMock = new SocketClientServiceMock();
        matchHandlerServiceStub = jasmine.createSpyObj('MatchHandlerService', ['checkCode', 'checkUsername']);
        await TestBed.configureTestingModule({
            imports: [FormsModule, HttpClientModule],
            declarations: [QuestionDisplayComponent],
            providers: [
                { provide: CommunicationService },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: MatchHandlerService, useValue: matchHandlerServiceStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(QuestionDisplayComponent);
                component = fixture.componentInstance;

                component.currentQuestion = {
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
                };
                component.timeLeft = 15;
                // component.autoSubmitEnabled = false;
                fixture.detectChanges();
            });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should call the start timer', fakeAsync(() => {
    //     const spy = spyOn(component, 'startTimer');
    //     component.resetTimer();
    //     expect(spy).toHaveBeenCalled();
    //     flush();
    // }));

    // it('should should call the clearTimeout', fakeAsync(() => {
    //     const spy = spyOn(window, 'clearTimeout');
    //     component.timer = setTimeout(() => '', component.questionTime);
    //     component.resetTimer();
    //     expect(spy).toHaveBeenCalled();
    //     flush();
    // // }));
    // it('should not call the clearTimeout ', fakeAsync(() => {
    //     const spy = spyOn(window, 'clearTimeout');
    //     component.resetTimer();
    //     expect(spy).not.toHaveBeenCalled();
    //     flush();
    // }));

    // it('should call the settimeout ', fakeAsync(() => {
    //     const spy = spyOn(window, 'setTimeout');
    //     component.startTimer();
    //     expect(spy).toHaveBeenCalled();
    //     discardPeriodicTasks();
    // }));
    // it('should should call the submitaswnser at the end of the timer', fakeAsync(() => {
    //     const spy = spyOn(component, 'submitAnswers');
    //     component.startTimer();
    //     tick(component.questionTime * MS);
    //     expect(spy).toHaveBeenCalled();
    //     discardPeriodicTasks();
    // }));

    it('should should call the emit QCM', fakeAsync(() => {
        component.currentQuestion.type = 'QCM';
        const spy2 = spyOn(component.answersSubmitted, 'emit');
        component.submitAnswers();
        expect(spy2).toHaveBeenCalledOnceWith(component.selectedAnswerIndexes);
        discardPeriodicTasks();
    }));

    it('should should call the emit QRL', fakeAsync(() => {
        component.currentQuestion.type = 'QRL';
        const spy2 = spyOn(component.answersSubmitted, 'emit');
        component.submitAnswers();
        expect(spy2).toHaveBeenCalledOnceWith(component.qrlAnswer);
        discardPeriodicTasks();
    }));

    it('should should call chatFocused', fakeAsync(() => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', { key: '1' });
        component.isChatFocused = true;
        expect(component.handleKeyboardEvent(event)).toEqual(undefined);
    }));

    it('should should call the validateAnswers ', fakeAsync(() => {
        const spy2 = spyOn(component, 'validateAnswers');
        component.submitAnswers();
        expect(spy2).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should should call preventDefault and  stopPropagation ', fakeAsync(() => {
        const event: KeyboardEvent = new KeyboardEvent('keypress', { key: '1' });
        const spy = spyOn(event, 'preventDefault');
        const spy2 = spyOn(event, 'stopPropagation');
        component.preventKeyDownEnter(event);
        expect(spy).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
    }));

    it('should should call checkasnwer', fakeAsync(() => {
        component.timeLeft = 3;
        const spy = spyOn(component, 'checkAnswers');
        // directly call ngOnChanges
        component.ngOnChanges({
            timeLeft: new SimpleChange(null, component.timeLeft, true),
        });
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    it('should should call submit and selectedanswertest', fakeAsync(() => {
        component.currentQuestion = {
            type: 'QCM',
            text: 'yo',
            points: 5,
            choices: [],
        };
        component.isSubmitted = true;
        component.selectedAnswerIndexes = [1];
        // directly call ngOnChanges
        component.ngOnChanges({
            currentQuestion: new SimpleChange(null, component.currentQuestion, true),
        });
        fixture.detectChanges();
        expect(component.isSubmitted).toBeFalse();
        expect(component.selectedAnswerIndexes).toEqual([]);
    }));

    it('should should call verificiation checkAnswers', fakeAsync(() => {
        component.timeLeft = 0;
        //   component.autoSubmitEnabled=false;
        const spy = spyOn(component, 'submitAnswers');

        component.checkAnswers();

        expect(spy).toHaveBeenCalled();
    }));

    it('should call  submitAnswers on checkAnswers', fakeAsync(() => {
        component.timeLeft = 1;
        // component.autoSubmitEnabled=false;
        const spy = spyOn(component, 'submitAnswers');

        component.checkAnswers();

        expect(spy).not.toHaveBeenCalled();
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
        component.matchHandler.accessCode = '5190';
        const spy = spyOn(component['socketService'], 'send');
        const eventName = 'unselectAnswer';
        const testString = { accessCode: '5190', answerIndex: 1 };
        component.toggleChoice(1);
        expect(component.selectedAnswerIndexes[0]).toEqual(2);
        expect(spy).toHaveBeenCalledWith(eventName, testString);
    }));

    it('should not put index in the answer choices', fakeAsync(() => {
        component.selectedAnswerIndexes = [1, 2];
        expect(component.selectedAnswerIndexes[0]).toEqual(1);
        component.matchHandler.accessCode = '5190';
        const spy = spyOn(component['socketService'], 'send');
        const eventName = 'selectAnswer';
        const testString = { accessCode: '5190', answerIndex: 3 };
        component.toggleChoice(3);
        expect(component.selectedAnswerIndexes.length).toEqual(3);
        expect(spy).toHaveBeenCalledWith(eventName, testString);
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

    it('should onInputChange ', () => {
        // const event: KeyboardEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        const spy = spyOn(component['socketService'], 'send');
        const eventName = MatchEvents.NewInteraction;
        component.matchHandler.accessCode = '5826';
        const testString = { accessCode: component.matchHandler.accessCode };
        component.onInputChange();
        expect(spy).toHaveBeenCalledWith(eventName, testString);
    });

    // it('should check if resetTimerSpy was called in ngOnChanges lifecycle hook', () => {
    //     component.isSubmitted = true;
    //     component.selectedAnswerIndexes = [1, 2];
    //     const resetTimerSpy = spyOn(component, 'resetTimer');
    //     component.ngOnChanges();
    //     expect(component.isSubmitted).toEqual(false);
    //     expect(component.selectedAnswerIndexes).toEqual([]);
    //     expect(resetTimerSpy).toHaveBeenCalled();
    // });
});
