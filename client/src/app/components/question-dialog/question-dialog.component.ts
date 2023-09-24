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
        name: '',
        nPoints: 0,
        choices: [],
    };

    constructor(
        public dialogRef: MatDialogRef<QuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Question,
    ) {
        if (data) this.question = data;
        else {
            this.question.choices.push({ name: '', state: false });
            this.question.choices.push({ name: '', state: false });
        }
    }

    addChoice() {
        if (this.question.choices.length < MAX_CHOICES) {
            this.question.choices.push({ name: '', state: false });
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
        if (!this.question.name) {
            return false;
        }

        if (this.question.nPoints < MIN_POINTS || this.question.nPoints > MAX_POINTS || this.question.nPoints % POINTS_STEP !== 0) {
            return false;
        }

        const filledChoices = this.question.choices.filter((choice) => choice.name.trim() !== '');

        const corectChoices = this.question.choices.filter((choice) => choice.state === true);
        const incorrectChoices = this.question.choices.filter((choice) => choice.state === false);

        if (corectChoices.length < MIN_CORRECT_CHOICES || incorrectChoices.length < MIN_INCORRECT_CHOICES) {
            return false;
        }

        if (filledChoices.length < MIN_CHOICES) {
            return false;
        }

        return true;
    }
}
