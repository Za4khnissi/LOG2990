import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Choice } from '@app/interfaces/definitions';

interface CorrectChoiceData {
    correctChoices: Choice[];
    bonusMessage: [];
}

@Component({
    selector: 'app-question-result-dialog',
    templateUrl: './question-result-dialog.component.html',
    styleUrls: ['./question-result-dialog.component.scss'],
})
export class QuestionResultDialogComponent {
    correctChoices = this.data.correctChoices;
    bonusMessage = this.data.bonusMessage;

    constructor(@Inject(MAT_DIALOG_DATA) public data: CorrectChoiceData) {}
}
