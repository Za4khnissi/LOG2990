import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MAX_CHOICES, MAX_POINTS, MIN_CHOICES, MIN_CORRECT_CHOICES, MIN_INCORRECT_CHOICES, MIN_POINTS, POINTS_STEP } from '@common/constants';
import { Choice, QCMQuestion, Question } from '@common/definitions';

@Component({
    selector: 'app-question-dialog',
    templateUrl: './question-dialog.component.html',
    styleUrls: ['./question-dialog.component.scss'],
})
export class QuestionDialogComponent {
    question: Question;
    baseChoice: Choice = { text: '', isCorrect: false };
    baseQuestion: Question = {
        type: 'QRL',
        text: '',
        points: 10,
    };

    constructor(
        public dialogRef: MatDialogRef<QuestionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Question,
    ) {
        this.question = data || this.baseQuestion;
        if (this.question.type === 'QCM' && !this.question.choices) {
            this.question.choices = this.initializeChoices();
        }
    }

    addChoice() {
        if (this.question.type === 'QCM' && this.question.choices && this.question.choices.length < MAX_CHOICES) {
            this.question.choices.push(this.getNewBaseChoice());
        }
    }

    removeChoice(index: number) {
        if (this.question.type === 'QCM' && this.question.choices) {
            this.question.choices.splice(index, 1);
        }
    }

    onTypeChange(type: 'QCM' | 'QRL') {
        this.question.type = type;
        if (type === 'QCM') {
            (this.question as QCMQuestion).choices = (this.question as QCMQuestion).choices || this.initializeChoices();
        } else {
            if ('choices' in this.question) {
                delete (this.question as QCMQuestion).choices;
            }
        }
    }

    onConfirm() {
        this.dialogRef.close(this.question);
    }

    drop(event: CdkDragDrop<Choice[]>): void {
        if (this.question.type === 'QCM' && this.question.choices) {
            moveItemInArray(this.question.choices, event.previousIndex, event.currentIndex);
        }
    }

    isFormValid(): boolean {
        if (!this.question.text) return false;

        const { type, points } = this.question;

        if (points < MIN_POINTS || points > MAX_POINTS || points % POINTS_STEP !== 0) return false;

        if (type === 'QCM') {
            const { choices } = this.question;
            const filledChoices = choices?.filter((choice) => choice.text.trim() !== '') || [];
            const correctChoicesCount = choices?.filter((choice) => choice.isCorrect).length || 0;
            const incorrectChoicesCount = choices?.filter((choice) => !choice.isCorrect).length || 0;

            if (correctChoicesCount < MIN_CORRECT_CHOICES || incorrectChoicesCount < MIN_INCORRECT_CHOICES || filledChoices.length < MIN_CHOICES)
                return false;
        }
        return true;
    }

    private initializeChoices(): Choice[] {
        return [this.getNewBaseChoice(), this.getNewBaseChoice()];
    }

    private getNewBaseChoice(): Choice {
        return { text: '', isCorrect: false };
    }
}
