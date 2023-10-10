import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Question } from '@app/interfaces/definitions';

const MAX_CHOICES = 4;
const MIN_CHOICES = 2;
const MIN_POINTS = 10;
const MAX_POINTS = 100;
const POINTS_STEP = 10;
const MIN_CORRECT_CHOICES = 1;
const MIN_INCORRECT_CHOICES = 1;

@Component({
    selector: 'app-question-dialog',
    templateUrl: './question-dialog.component.html',
    styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent {
    question: Question = {
        type: 'QCM',
        text: '',
        points: 0,
        choices: [],
    };

    constructor(
        public dialogRef: MatDialogRef<QuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Question,
    ) {
        if (data) this.question = data;
        else {
            this.question.choices.push({ text: '', isCorrect: false });
            this.question.choices.push({ text: '', isCorrect: false });
        }
    }

    addChoice() {
        if (this.question.choices.length < MAX_CHOICES) {
            this.question.choices.push({ text: '', isCorrect: false });
        }
    }

    removeChoice(index: number) {
        this.question.choices.splice(index, 1);
    }

    onConfirm() {
        this.dialogRef.close(this.question);
    }

    moveChoiceUp(index: number) {
        if (index > 0) {
            const temp = this.question.choices[index - 1];
            this.question.choices[index - 1] = this.question.choices[index];
            this.question.choices[index] = temp;
        }
    }

    moveChoiceDown(index: number) {
        if (index < this.question.choices.length - 1) {
            const temp = this.question.choices[index + 1];
            this.question.choices[index + 1] = this.question.choices[index];
            this.question.choices[index] = temp;
        }
    }

    isFormValid(): boolean {
        if (!this.question.text) return false;

        const { points, choices } = this.question;

        if (points < MIN_POINTS || points > MAX_POINTS || points % POINTS_STEP !== 0) return false;

        const filledChoices = choices.filter((choice) => choice.text.trim() !== '');
        const correctChoicesCount = choices.filter((choice) => choice.isCorrect).length;
        const incorrectChoicesCount = choices.filter((choice) => !choice.isCorrect).length;

        if (correctChoicesCount < MIN_CORRECT_CHOICES || incorrectChoicesCount < MIN_INCORRECT_CHOICES || filledChoices.length < MIN_CHOICES)
            return false;

        return true;
    }
}
