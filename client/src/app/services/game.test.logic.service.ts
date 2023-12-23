import { Injectable } from '@angular/core';
import { IMPOSSIBLE_INDEX, INTERVAL, PROGRESS } from '@common/constants';
import { Question } from '@common/definitions';

@Injectable({
    providedIn: 'root',
})
export class GameTestLogicService {
    timeLeft: number;
    progressValue: number = PROGRESS;
    private timer: ReturnType<typeof setInterval>;

    verifyQuestion(question: Question, selectedAnswer: number[] | string) {
        if (question.type === 'QCM' && question.choices && Array.isArray(selectedAnswer)) {
            const correctAnswerIndexes = question.choices
                .map((choice, index) => (choice.isCorrect ? index : IMPOSSIBLE_INDEX))
                .filter((index) => index !== IMPOSSIBLE_INDEX);

            let isCorrect = false;

            if (correctAnswerIndexes.length === selectedAnswer.length) {
                isCorrect = correctAnswerIndexes.every((index) => {
                    return selectedAnswer.includes(index);
                });
            }

            return { isCorrect, correctChoices: correctAnswerIndexes };
        } else {
            return { isCorrect: true, correctChoices: [] };
        }
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
