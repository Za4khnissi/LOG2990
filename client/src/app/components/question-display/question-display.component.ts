import { Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { Question } from '@app/interfaces/definitions';

const MS = 1000;
const IMPOSSIBLE_INDEX = -1;
@Component({
    selector: 'app-question-display',
    templateUrl: './question-display.component.html',
    styleUrls: ['./question-display.component.scss'],
})
export class QuestionDisplayComponent implements OnDestroy, OnChanges {
    @Input() currentQuestion: Question;
    @Input() questionTime: number;
    @Input() autoSubmitEnabled: boolean;
    @Output() answersSubmitted = new EventEmitter<number[]>();

    selectedAnswerIndexes: number[] = [];
    isSubmitted = false;
    timer: ReturnType<typeof setTimeout>;

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        const numberPressed = parseInt(event.key, 10);
        if (numberPressed >= 1 && numberPressed <= this.currentQuestion.choices.length) {
            this.toggleChoice(numberPressed - 1);
        }

        if (event.key === 'Enter') {
            this.submitAnswers();
        }
    }

    ngOnChanges(): void {
        this.resetTimer();
        this.isSubmitted = false;
        this.selectedAnswerIndexes = [];
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
    }

    resetTimer() {
        if (this.timer) clearTimeout(this.timer);
        this.startTimer();
    }

    startTimer() {
        this.timer = setTimeout(() => {
            if (!this.autoSubmitEnabled || !this.isSubmitted) this.submitAnswers();
        }, this.questionTime * MS);
    }

    validateAnswers() {
        this.isSubmitted = true;
    }

    submitAnswers() {
        this.validateAnswers();
        this.answersSubmitted.emit(this.selectedAnswerIndexes);
    }

    toggleChoice(index: number) {
        const idx = this.selectedAnswerIndexes.indexOf(index);
        if (idx > IMPOSSIBLE_INDEX) {
            this.selectedAnswerIndexes.splice(idx, 1);
        } else {
            this.selectedAnswerIndexes.push(index);
        }
    }

    isSelected(index: number): boolean {
        return this.selectedAnswerIndexes.includes(index);
    }
}
