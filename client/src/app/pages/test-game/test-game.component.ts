import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameOverDialogComponent } from '@app/components/game-over-dialog/game-over-dialog.component';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameLogicService } from '@app/services/game-logic.service';

const PERCENTAGE = 1.2;
const MS = 3000;

@Component({
    selector: 'app-test-game',
    templateUrl: './test-game.component.html',
    styleUrls: ['./test-game.component.scss'],
})
export class TestGameComponent implements OnDestroy, OnInit {
    score = 0;
    currentQuestionIndex = 0;
    autoSubmitEnabled = true;
    isDataLoaded = false;

    game: Game;
    constructor(
        private router: Router,
        private dialog: MatDialog,
        public gameLogicService: GameLogicService,
        private route: ActivatedRoute,
        readonly communicationService: CommunicationService,
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            const gameId = params['id'];
            this.communicationService.getGameById(gameId).subscribe((e) => {
                this.game = e;
                this.isDataLoaded = true;
                this.gameLogicService.start(this.game.duration);
            });
        });
    }

    moveToNextQuestion(selectedAnswerIndexes: number[]) {
        const currentQuestion = this.game.questions[this.currentQuestionIndex];

        const { isCorrect, correctChoices } = this.gameLogicService.verifyQuestion(currentQuestion, selectedAnswerIndexes);

        let bonusMessage = '';

        if (isCorrect) {
            this.score += currentQuestion.points * PERCENTAGE;
            bonusMessage = 'Correct! Vous avez reçu un bonus de 20%';
        }

        this.gameLogicService.stop();
        this.dialog.open(QuestionResultDialogComponent, {
            data: { correctChoices, bonusMessage },
        });

        setTimeout(() => {
            this.dialog.closeAll();

            if (this.currentQuestionIndex + 1 >= this.game.questions.length) {
                this.endGame();
                return;
            }
            this.currentQuestionIndex++;

            this.gameLogicService.reset(this.game.duration);
        }, MS); // wait 3 seconds
    }

    endGame() {
        this.gameLogicService.stop();
        this.dialog
            .open(GameOverDialogComponent, {
                data: { score: this.score },
            })
            .afterClosed()
            .subscribe(() => {
                this.router.navigate(['/games']);
            });
    }

    abandonGame() {
        this.gameLogicService.stop();
        this.router.navigate(['/games']);
    }

    ngOnDestroy() {
        this.gameLogicService.stop();
    }
}
