import { Injectable } from '@angular/core';
import { Question } from '@app/interfaces/definitions';

const PROGRESS = 100;
const INTERVAL = 1000;
const IMPOSSIBLE_INDEX = -1;
@Injectable({
    providedIn: 'root',
})
export class GameLogicService {
    timeLeft: number;
    progressValue: number = PROGRESS;
    private timer: ReturnType<typeof setInterval>;

    verifyQuestion(question: Question, selectedAnswerIndexes: number[]) {
        const correctAnswerIndexes = question.choices
            .map((choice, index) => (choice.isCorrect === true ? index : IMPOSSIBLE_INDEX))
            .filter((index) => index !== IMPOSSIBLE_INDEX);

        let isCorrect = false;

        if (correctAnswerIndexes.length === selectedAnswerIndexes.length) {
            isCorrect = correctAnswerIndexes.every((index) => {
                return selectedAnswerIndexes.includes(index);
            });
        }

        const correctChoices = question.choices.filter((choice) => choice.isCorrect);

        return { isCorrect, correctChoices };
    }

    start(time: number) {
        this.timeLeft = time;
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.progressValue = (this.timeLeft / time) * PROGRESS;
        }, INTERVAL);
    }

    stop() {
        clearInterval(this.timer);
    }

    reset(time: number) {
        this.stop();
        this.start(time);
    }
}
