import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { QuestionResultDialogComponent } from '@app/components/question-result-dialog/question-result-dialog.component';
import { TransitionDialogComponent } from '@app/components/transition-dialog/transition-dialog.component';
import { CommunicationService } from '@app/services/communication.service';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { DialogData, Player, PlayerResult, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';

@Component({
    selector: 'app-play-game',
    templateUrl: './play-game.component.html',
    styleUrls: ['./play-game.component.scss'],
})
export class PlayGameComponent implements OnDestroy, OnInit {
    @ViewChild('gameChoice') gameChoice: ElementRef | undefined;
    @ViewChild('chat') chat: ElementRef | undefined;

    score = 0;
    isTest = false;
    isDataLoaded = false;

    isChatFocused = false;
    isGameFocused = false;
    timerState = TimerState;

    constructor(
        private router: Router,
        private dialog: MatDialog,
        public gameLogicService: GameplayLogicService,
        readonly communicationService: CommunicationService,
        private readonly socketService: SocketClientService,
        readonly matchHandler: MatchHandlerService,
        private zone: NgZone,
    ) {}

    ngOnInit(): void {
        this.isDataLoaded = true;
        this.gameLogicService.start();
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.socketService.on(MatchEvents.PlayerResult, (playerResult: PlayerResult) => this.handlePlayerResult(playerResult));

        this.socketService.on(MatchEvents.NextQuestion, (index: number) => this.moveToNextQuestion(index));

        this.socketService.on(MatchEvents.OrganizerLeft, () => this.endGame());

        this.socketService.on(MatchEvents.FinalResults, (players: Player[]) => this.showResults(players));
    }

    submitAnswers(selectedAnswer: number[] | string) {
        this.socketService.send(MatchEvents.SubmitAnswers, { accessCode: this.matchHandler.accessCode, answer: selectedAnswer });
    }

    moveToNextQuestion(questionIndex: number) {
        this.dialog.closeAll();

        const dialogInfo: DialogData = { message: 'Question suivante dans', duration: 3 };

        const transitionDialog = this.dialog.open(TransitionDialogComponent, { data: dialogInfo, disableClose: true });

        transitionDialog.afterClosed().subscribe(() => {
            this.gameLogicService.currentQuestionIndex = questionIndex;
        });
    }

    handlePlayerResult(playerResult: PlayerResult) {
        const currentQuestion = this.matchHandler.game.questions[this.gameLogicService.currentQuestionIndex];
        let message = "Incorrect, vous n'avez pas reçu tous les points";
        this.score = playerResult.score;
        if (playerResult.hasBonus) {
            message = 'Correct! Vous avez reçu un bonus de 20%';
        } else if (playerResult.isCorrect) {
            message = 'Correct!';
        } else if (currentQuestion.type === 'QCM') {
            const correctAnswersText = playerResult.correctChoices
                .map((index) => currentQuestion.choices?.[index]?.text)
                .filter((text) => text)
                .join(', ');
            message = `Incorrect, La bonne réponse est: ${correctAnswersText}`;
        }

        const correctChoices =
            currentQuestion.type === 'QCM' && currentQuestion.choices
                ? currentQuestion.choices.filter((choice, index) => playerResult.correctChoices.includes(index))
                : [];

        this.dialog.open(QuestionResultDialogComponent, {
            data: { correctChoices, message, isCorrect: playerResult.isCorrect },
        });
    }

    endGame() {
        this.dialog.closeAll();

        this.socketService.disconnect();
        this.zone.run(() => {
            this.router.navigate(['/home']);
        });
    }

    abandonGame() {
        this.socketService.send(MatchEvents.LeaveGame, this.matchHandler.accessCode);
        this.endGame();
    }

    ngOnDestroy() {
        if (!this.gameLogicService.isGameOver) this.abandonGame();
    }

    showResults(players: Player[]) {
        this.gameLogicService.isGameOver = true;
        this.dialog.closeAll();
        this.matchHandler.players = players;
        this.zone.run(() => {
            this.router.navigate(['/game/results']);
        });
    }

    setFocusOnChat() {
        this.chat?.nativeElement?.focus();
        this.isChatFocused = true;
        this.isGameFocused = false;
    }

    setFocusOnGame() {
        this.gameChoice?.nativeElement?.focus();
        this.isChatFocused = false;
        this.isGameFocused = true;
    }
}
