import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WAIT_TIME, DIAMETER_VALUE } from '@common/constants';
import { DialogData } from '@common/definitions';

@Component({
    selector: 'app-transition-dialog',
    templateUrl: './transition-dialog.component.html',
    styleUrls: ['./transition-dialog.component.scss'],
})
export class TransitionDialogComponent implements OnInit {
    timer: ReturnType<typeof setInterval>;
    remainingTime: number;
    diameter = DIAMETER_VALUE;

    constructor(
        public dialogRef: MatDialogRef<TransitionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
    ) {}

    ngOnInit(): void {
        this.remainingTime = this.data.duration;
        this.timer = setInterval(() => {
            this.remainingTime -= 1;
            if (this.remainingTime <= 0) {
                clearInterval(this.timer);
                this.dialogRef.close();
            }
        }, WAIT_TIME);
    }
}
