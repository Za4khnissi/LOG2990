import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Location } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuestionDialogComponent } from '@app/components/question-dialog/question-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';
import { IMPOSSIBLE_INDEX } from '@common/constants';
import { Game, Question, Submission } from '@common/definitions';

@Component({
    selector: 'app-create-game',
    templateUrl: './create-game.component.html',
    styleUrls: ['./create-game.component.scss'],
})
export class CreateGameComponent implements OnInit, OnDestroy {
    messageTime: string = '';
    messageName: string = '';
    isEdit: boolean = false;

    game: Game = {
        id: '',
        lastModification: '',
        title: '',
        description: '',
        duration: 10,
        visible: false,
        questions: [],
    };

    constructor(
        private dialog: MatDialog,
        public router: Router,
        private passwordService: PasswordService,
        readonly communicationService: CommunicationService,
        readonly gameCreationService: GameCreationService,
        private location: Location,
        public zone: NgZone,
    ) {}

    ngOnInit() {
        this.isEdit = this.gameCreationService.isEdit;
        this.gameCreationService.fetchGamesFromServer();
        if (this.gameCreationService.selectedGame && this.isEdit) {
            this.game = { ...this.gameCreationService.selectedGame };
        }
    }

    checkTime(): void {
        const messageTimeElement: HTMLElement = document.getElementsByClassName('message-time')[0] as HTMLElement;
        const timeCheck = this.gameCreationService.isTimeValid(this.game.duration);
        messageTimeElement.style.color = timeCheck[1] ? 'green' : 'red';
        this.messageTime = timeCheck[0];
    }

    checkName(): void {
        const messageNameElement: HTMLElement = document.getElementsByClassName('message-name')[0] as HTMLElement;
        const nameCheck = this.gameCreationService.isNameValid(this.game.title);
        messageNameElement.style.color = nameCheck[1] ? 'green' : 'red';
        this.messageName = nameCheck[0];
    }

    submit(): void {
        this.gameCreationService.checkAllAndSubmit(this.game).subscribe((submission: Submission) => {
            if (!submission.state) {
                alert(submission.msg);
            } else {
                this.passwordService.setLoginState(true);
                this.zone.run(() => {
                    this.location.replaceState('/admin');
                    this.router.navigate(['/admin']);
                });
            }
        });
    }

    openDialog() {
        const dialogRef = this.dialog.open(QuestionDialogComponent);

        dialogRef.afterClosed().subscribe((question: Question) => {
            if (question) {
                if (question.type === 'QCM' && question.choices) {
                    question.choices = question.choices.filter((choice) => choice.text !== '');
                }
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
        this.zone.run(() => {
            this.router.navigate(['/admin'], { replaceUrl: true });
        });
    }

    ngOnDestroy() {
        this.cancel();
    }
}
