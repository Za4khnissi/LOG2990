import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { GameOverDialogComponent } from '@app/components/game-over-dialog/game-over-dialog.component';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameTestLogicService } from '@app/services/game.test.logic.service';
import { DEFAULT_MULTIPLIER, PERCENTAGE, WAIT_TIME } from '@common/constants';
import { Game } from '@common/definitions';

@Component({
    selector: 'app-test-game',
    templateUrl: './test-game.component.html',
    styleUrls: ['./test-game.component.scss'],
})
export class TestGameComponent implements OnDestroy, OnInit {
    score = 0;
    currentQuestionIndex = 0;
    isTest = true;
    isDataLoaded = false;

    game: Game;
    constructor(
        private router: Router,
        private dialog: MatDialog,
        public gameLogicService: GameTestLogicService,
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

    moveToNextQuestion(selectedAnswer: number[] | string) {
        const currentQuestion = this.game.questions[this.currentQuestionIndex];
        const { isCorrect, correctChoices } = this.gameLogicService.verifyQuestion(currentQuestion, selectedAnswer);

        let message = 'Incorrect';

        if (isCorrect) {
            const multiplier = currentQuestion.type === 'QCM' ? PERCENTAGE : DEFAULT_MULTIPLIER;
            this.score += currentQuestion.points * multiplier;
            message = currentQuestion.type === 'QCM' ? 'Correct! Vous avez reçu un bonus de 20%' : 'Correct!';
        } else if (currentQuestion.type === 'QCM') {
            const correctAnswersText = correctChoices
                .map((index) => currentQuestion.choices?.[index]?.text)
                .filter((text) => text)
                .join(', ');
            message = `Incorrect! La bonne réponse est: ${correctAnswersText}`;
        }

        this.gameLogicService.stop();
        this.dialog.open(QuestionResultDialogComponent, {
            data: { correctChoices, message, isCorrect },
        });

        setTimeout(() => {
            this.dialog.closeAll();

            if (this.currentQuestionIndex + 1 >= this.game.questions.length) {
                this.endGame();
                return;
            }
            this.currentQuestionIndex++;

            this.gameLogicService.reset(this.game.duration);
        }, WAIT_TIME * 3);
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
