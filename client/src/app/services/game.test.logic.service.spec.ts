import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';

import { Question } from '@common/definitions';
import { GameTestLogicService } from './game.test.logic.service';

describe('GameLogicService', () => {
    let service: GameTestLogicService;
    const TIMEOUT = 5;
    const TIME_OUT_PROGRESS_FIRST_SECOND = 80;
    const TIME_OUT_PROGRESS_SECOND_SECOND = 60;
    const MS_SECOND = 1000;
    const CHOICE: Question = {
        type: 'QCM',
        text: 'Question 2 for game1',
        points: 15,
        choices: [
            {
                text: 'Choice 2.1',
                isCorrect: false,
            },
            {
                text: 'Choice 2.2',
                isCorrect: true,
            },
        ],
    };

    const CHOICEQRL: Question = {
        type: 'QRL',
        text: 'Question 2 for game1',
        points: 15,
    };
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameTestLogicService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('start should start an interval', fakeAsync(() => {
        service.start(TIMEOUT);
        const interval = service['timer'];
        expect(interval).toBeTruthy();
        expect(service.timeLeft).toEqual(TIMEOUT);
        discardPeriodicTasks();
    }));

    it('start should call setInterval', fakeAsync(() => {
        const spy = spyOn(window, 'setInterval');
        service.start(TIMEOUT);
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('interval should reduce time by 1 every second ', fakeAsync(() => {
        service.start(TIMEOUT);
        tick(MS_SECOND);
        expect(service.timeLeft).toEqual(TIMEOUT - 1);
        expect(service.progressValue).toEqual(TIME_OUT_PROGRESS_FIRST_SECOND);
        tick(MS_SECOND);
        expect(service.timeLeft).toEqual(TIMEOUT - 2);
        expect(service.progressValue).toEqual(TIME_OUT_PROGRESS_SECOND_SECOND);
        discardPeriodicTasks();
    }));

    it('stop should call clearInterval and setInterval to undefined', fakeAsync(() => {
        const spy = spyOn(window, 'clearInterval');
        service.stop();
        expect(spy).toHaveBeenCalled();
        expect(service['timer']).toBeFalsy();
        discardPeriodicTasks();
    }));

    it('should check that the timer starts again from the beginning', fakeAsync(() => {
        service.start(TIMEOUT);
        tick(MS_SECOND);
        expect(service.timeLeft).toEqual(TIMEOUT - 1);
        service.reset(TIMEOUT);
        expect(service.timeLeft).toEqual(TIMEOUT);
        discardPeriodicTasks();
    }));

    it('should check that the reset calls stop', fakeAsync(() => {
        const spystop = spyOn(service, 'stop');
        service.reset(TIMEOUT);
        expect(spystop).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should check that the reset calls start', fakeAsync(() => {
        const spystart = spyOn(service, 'start');
        service.reset(TIMEOUT);
        expect(spystart).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('should check that he has all the correct answers', () => {
        const selectedAnswerIndexes: number[] = [1];
        const bonfonctionnement = service.verifyQuestion(CHOICE, selectedAnswerIndexes);
        expect(bonfonctionnement['isCorrect']).toEqual(true);
        // expect(bonfonctionnement['correctChoices']).toEqual([CHOICE.choices[1]]);
    });

    it('should check if this question is type QRL', () => {
        const selectedAnswerIndexes: number[] = [];
        const bonfonctionnement = service.verifyQuestion(CHOICEQRL, selectedAnswerIndexes);
        expect(bonfonctionnement['isCorrect']).toEqual(true);
        // expect(bonfonctionnement['correctChoices']).toEqual([CHOICE.choices[1]]);
    });

    it('should check that he made a mistake ', () => {
        const selectedAnswerIndexes: number[] = [0];
        const bonfonctionnement = service.verifyQuestion(CHOICE, selectedAnswerIndexes);
        expect(bonfonctionnement['isCorrect']).toEqual(false);
        // expect(bonfonctionnement['correctChoices']).toEqual([CHOICE.choices[1]]);
    });

    it(' should check that he has not checked the right number of correct answers ', () => {
        const selectedAnswerIndexes: number[] = [0, 1];
        const bonfonctionnement = service.verifyQuestion(CHOICE, selectedAnswerIndexes);
        expect(bonfonctionnement['isCorrect']).toEqual(false);
        // expect(bonfonctionnement['correctChoices']).toEqual([CHOICE.choices[1]]);
    });
});
