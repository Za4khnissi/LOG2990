import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CorrectChoiceData } from '@common/definitions';
@Component({
    selector: 'app-question-result-dialog',
    templateUrl: './question-result-dialog.component.html',
    styleUrls: ['./question-result-dialog.component.scss'],
})
export class QuestionResultDialogComponent {
    correctChoices = this.data.correctChoices;
    message = this.data.message;
    isCorrect = this.data.isCorrect;

    constructor(@Inject(MAT_DIALOG_DATA) public data: CorrectChoiceData) {}
}
