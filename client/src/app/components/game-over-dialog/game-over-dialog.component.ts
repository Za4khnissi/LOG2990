import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-game-over-dialog',
    templateUrl: './game-over-dialog.component.html',
    styleUrls: ['./game-over-dialog.component.scss'],
})
export class GameOverDialogComponent {
    score: number = this.data.score;

    constructor(@Inject(MAT_DIALOG_DATA) public data: { score: number }) {}
}
