import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameOverDialogComponent } from '@app/components/game-over-dialog/game-over-dialog.component';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameLogicService } from '@app/services/game-logic.service';

const PERCENTAGE = 1.2;
@Component({
    selector: 'app-play-game',
    templateUrl: './play-game.component.html',
    styleUrls: ['./play-game.component.scss'],
})
export class PlayGameComponent implements OnDestroy, OnInit {
    score = 0;
    currentQuestionIndex = 0;
    autoSubmitEnabled = true;
    isDataLoaded = false;

    game: Game;
    constructor(
        // idGameToPlay: number,
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
        this.gameLogicService.stop();
        const currentQuestion = this.game.questions[this.currentQuestionIndex];

        const { isCorrect, correctChoices } = this.gameLogicService.verifyQuestion(currentQuestion, selectedAnswerIndexes);

        let bonusMessage = '';

        if (isCorrect) {
            this.score += currentQuestion.points * PERCENTAGE;
            bonusMessage = 'Correct! Vous avez reçu un bonus de 20%';
        }

        this.gameLogicService.stop();
        const dialogRef = this.dialog.open(QuestionResultDialogComponent, {
            data: { correctChoices, bonusMessage },
        });

        dialogRef.afterClosed().subscribe(() => {
            if (this.currentQuestionIndex + 1 >= this.game.questions.length) {
                this.endGame();
                return;
            }
            this.currentQuestionIndex++;
            this.gameLogicService.reset(this.game.duration);
        });
    }

    endGame() {
        this.gameLogicService.stop();
        const gameOverDialogRef = this.dialog.open(GameOverDialogComponent, {
            data: { score: this.score },
        });

        gameOverDialogRef.afterClosed().subscribe(() => {
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
