import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuestionDialogComponent } from '@app/components/question-dialog/question-dialog.component';
import { Game, Question, Submission } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';

const IMPOSSIBLE_INDEX = -1;

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit {
    messtime: string = '';
    messname: string = '';
    isEdit: boolean = false;

    game: Game = {
        id: '',
        lastModification: '',
        title: '',
        description: '',
        duration: 0,
        visible: false,
        questions: [],
    };

    constructor(
        private dialog: MatDialog,
        public router: Router,
        private passwordService: PasswordService,
        readonly communicationService: CommunicationService,
        readonly gameCreationService: GameCreationService,
    ) {}

    ngOnInit() {
        this.isEdit = this.gameCreationService.isEdit;
        this.gameCreationService.fetchGamesFromServer();
        if (this.gameCreationService.selectedGame && this.isEdit) {
            this.game = { ...this.gameCreationService.selectedGame };
        }
    }

    checkTime(): void {
        const timeCheck = this.gameCreationService.isTimeValid(this.game.duration);
        this.messtime = timeCheck[0];
    }

    checkName(): void {
        const nameCheck = this.gameCreationService.isNameValid(this.game.title);
        this.messname = nameCheck[0];
    }

    submit(): void {
        this.gameCreationService.checkAllAndSubmit(this.game).subscribe((submission: Submission) => {
            if (!submission.state) {
                alert(submission.msg);
            } else {
                this.passwordService.setLoginState(true);
                this.router.navigate(['/admin']);
            }
        });
    }

    openDialog() {
        const dialogRef = this.dialog.open(QuestionDialogComponent);

        dialogRef.afterClosed().subscribe((question: Question) => {
            if (question) {
                question.choices = question.choices.filter((choice) => choice.text !== '');
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

    cancel(): void {
        this.passwordService.setLoginState(true);
        this.router.navigate(['/admin']);
    }
}
