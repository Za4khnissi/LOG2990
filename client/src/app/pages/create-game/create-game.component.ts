import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuestionDialogComponent } from '@app/components/question-dialog/question-dialog.component';
import { Game, Question } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/gamecreation.service';

const IMPOSSIBLE_INDEX = -1;
const BASE_MESSAGE_TIME = 'Mettez un chiffre entre 10 et 60';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit {
    messtime: string = BASE_MESSAGE_TIME;
    messname: string = '';
    isEdit: boolean = false;

    game: Game = {
        name: '',
        description: '',
        time: 0,
        questions: [
            { name: 'What is the capital of France?', nPoints: 10, choices: [] },
            { name: 'What is the capital of Spain?', nPoints: 10, choices: [] },
        ],
    };

    constructor(
        private dialog: MatDialog,
        readonly communicationservice: CommunicationService,
        readonly gameCreationService: GameCreationService,
    ) {}

    ngOnInit() {
        this.communicationservice.basicGet().subscribe((e) => (this.gameCreationService.gameList = e));
    }

    checkTime(): void {
        const timeCheck = this.gameCreationService.isTimeValid(this.game.time);
        this.messtime = timeCheck[0];
    }

    checkName(): void {
        const nameCheck = this.gameCreationService.isNameValid(this.game.name);
        this.messname = nameCheck[0];
    }

    checkAll(): void {
        const isNameValid = this.gameCreationService.isNameValid(this.game.name);
        const isTimeValid = this.gameCreationService.isTimeValid(this.game.time);
        if (isNameValid[1] && isTimeValid[1]) {
            if (this.isEdit) {
                this.gameCreationService.putToServer(this.game);
            } else {
                this.gameCreationService.sendToServer(this.game);
            }
        }
    }

    openDialog() {
        const dialogRef = this.dialog.open(QuestionDialogComponent);

        dialogRef.afterClosed().subscribe((question: Question) => {
            if (question) {
                this.game.questions.push(question);
            }
        });
    }

    drop(event: CdkDragDrop<Question[]>) {
        moveItemInArray(this.game.questions, event.previousIndex, event.currentIndex);
    }

    editQuestion(index: number) {
        const dialogRef = this.dialog.open(QuestionDialogComponent, {
            data: { ...this.game.questions[index] },
        });

        dialogRef.afterClosed().subscribe((updatedQuestion) => {
            if (updatedQuestion) {
                this.game.questions[index] = updatedQuestion;
            }
        });
    }

    deleteQuestion(index: number) {
        if (index > IMPOSSIBLE_INDEX) {
            this.game.questions.splice(index, 1);
        }
    }

    // Ajouter verification info frontend
}
