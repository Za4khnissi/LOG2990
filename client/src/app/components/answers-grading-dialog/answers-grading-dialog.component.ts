import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_VALUE, MID_VALUE, MIN_VALUE } from '@common/constants';
import { QrlAnswer } from '@common/definitions';

@Component({
    selector: 'app-answers-grading-dialog',
    templateUrl: './answers-grading-dialog.component.html',
    styleUrls: ['./answers-grading-dialog.component.scss'],
})
export class AnswersGradingDialogComponent {
    currentAnswerIndex: number = 0;
    currentAnswer: QrlAnswer;
    minValue = MIN_VALUE;
    midValue = MID_VALUE;
    maxValue = MAX_VALUE;

    constructor(
        public dialogRef: MatDialogRef<AnswersGradingDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public qRLAnswers: { [clientId: string]: QrlAnswer },
    ) {
        this.currentAnswer = this.qRLAnswers[Object.keys(this.qRLAnswers)[this.currentAnswerIndex]];
    }

    get isLastAnswer(): boolean {
        return this.currentAnswerIndex === Object.keys(this.qRLAnswers).length - 1;
    }
    hasNextAnswer(): boolean {
        return this.currentAnswerIndex < Object.keys(this.qRLAnswers).length - 1;
    }

    hasPreviousAnswer(): boolean {
        return this.currentAnswerIndex > 0;
    }

    nextAnswer() {
        if (!this.isLastAnswer && this.hasNextAnswer()) {
            this.currentAnswerIndex++;
            this.currentAnswer = this.qRLAnswers[Object.keys(this.qRLAnswers)[this.currentAnswerIndex]];
        }
    }

    previousAnswer() {
        if (this.hasPreviousAnswer()) {
            this.currentAnswerIndex--;
            this.currentAnswer = this.qRLAnswers[Object.keys(this.qRLAnswers)[this.currentAnswerIndex]];
        }
    }

    submitGrades() {
        this.dialogRef.close(this.qRLAnswers);
    }
}
