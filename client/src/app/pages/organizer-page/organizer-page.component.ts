import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AnswersGradingDialogComponent } from '@app/components/answers-grading-dialog/answers-grading-dialog.component';
import { TransitionDialogComponent } from '@app/components/transition-dialog/transition-dialog.component';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { PANIC_MODE_ACTIVATION_TIME_QCM, PANIC_MODE_ACTIVATION_TIME_QRL, REMAINING_TIME_QCM, REMAINING_TIME_QRL } from '@common/constants';
import { DialogData, Player, QrlAnswer, Question, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { ChartData } from 'chart.js';

@Component({
    selector: 'app-organizer-page',
    templateUrl: './organizer-page.component.html',
    styleUrls: ['./organizer-page.component.scss'],
})
export class OrganizerPageComponent implements OnInit, OnDestroy {
    @ViewChild('chat') chat: ElementRef | undefined;

    timerState = TimerState;

    barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
    };

    legendLabels: { text: string; fillStyle: string }[] = [];
    xAxisLabel: string = '';

    usersAnswersSubmitted = false;
    currentQuestion: Question;

    constructor(
        private socketService: SocketClientService,
        private router: Router,
        private dialog: MatDialog,
        readonly matchHandler: MatchHandlerService,
        public gameLogicService: GameplayLogicService,
        private zone: NgZone,
    ) {}

    ngOnInit(): void {
        this.configureBaseSocketFeatures();
        this.gameLogicService.timerState = TimerState.RUNNING;
        this.gameLogicService.start();
        this.currentQuestion = this.matchHandler.game.questions[this.gameLogicService.currentQuestionIndex];
        this.updateHistogram(this.gameLogicService.currentQuestionIndex);
    }

    configureBaseSocketFeatures() {
        this.socketService.on<string>('Error', (errorMessage) => {
            alert(errorMessage);
            this.zone.run(() => {
                this.router.navigate(['/home']);
            });
        });

        this.socketService.on<Player[]>(MatchEvents.AllPlayersResults, (updatedPlayers: Player[]) => {
            this.matchHandler.players = this.matchHandler.players.map((player: Player) => {
                const updatedPlayer = updatedPlayers.find((updatedPlayer_: Player) => updatedPlayer_.clientId === player.clientId);

                if (updatedPlayer) {
                    player.score = updatedPlayer.score;
                    player.bonusCount = updatedPlayer.bonusCount;
                }

                return player;
            });

            this.usersAnswersSubmitted = true;
        });

        this.socketService.on(MatchEvents.AnswerSelected, (selectedAnswerIndex: number) => {
            const newData = [...(this.barChartData.datasets[0].data as number[])];
            newData[selectedAnswerIndex] = newData[selectedAnswerIndex] + 1 || 1;
            this.barChartData = {
                ...this.barChartData,
                datasets: [{ ...this.barChartData.datasets[0], data: newData }],
            };
        });

        this.socketService.on(MatchEvents.AnswerUnselected, (selectedAnswerIndex: number) => {
            const newData = [...(this.barChartData.datasets[0].data as number[])];
            newData[selectedAnswerIndex] = newData[selectedAnswerIndex] > 0 ? newData[selectedAnswerIndex] - 1 : 0;
            this.barChartData = {
                ...this.barChartData,
                datasets: [{ ...this.barChartData.datasets[0], data: newData }],
            };
        });

        this.socketService.on(MatchEvents.QRLInteractionData, (interactions: number) => {
            const newData = [...(this.barChartData.datasets[0].data as number[])];
            newData[0] = interactions;
            newData[1] = this.matchHandler.players.length - interactions;
            this.barChartData = {
                ...this.barChartData,
                datasets: [{ ...this.barChartData.datasets[0], data: newData }],
            };
        });

        this.socketService.on(MatchEvents.qRLAnswersToGrade, (qRLAnswers: { [clientId: string]: QrlAnswer }) => this.startGrading(qRLAnswers));
    }

    ngOnDestroy(): void {
        if (!this.gameLogicService.isGameOver) {
            this.socketService.disconnect();
            this.zone.run(() => {
                this.router.navigate(['/home']);
            });
        }
    }

    updateHistogram(index: number): void {
        const { barChartData, xAxisLabel, legendLabels } = this.matchHandler.setupHistogramData(index, false);
        this.xAxisLabel = xAxisLabel;
        this.legendLabels = legendLabels;
        this.barChartData = { ...barChartData };
    }

    isLastQuestion(): boolean {
        return this.gameLogicService.currentQuestionIndex >= this.matchHandler.game.questions.length - 1;
    }

    startGrading(qRLAnswers: { [clientId: string]: QrlAnswer }) {
        const qRLAnswersArray = Object.entries(qRLAnswers);
        qRLAnswersArray.sort((a, b) => a[1].username.localeCompare(b[1].username));
        const sortedqRLAnswers = qRLAnswersArray.reduce(
            (acc, [key, value]) => {
                acc[key] = value;
                return acc;
            },
            {} as { [clientId: string]: QrlAnswer },
        );

        const dialogRef = this.dialog.open(AnswersGradingDialogComponent, {
            data: sortedqRLAnswers,
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            this.socketService.send(MatchEvents.GradingFinished, { accessCode: this.matchHandler.accessCode, qRLAnswers: result });
        });
    }

    goNext() {
        if (!this.isLastQuestion()) {
            this.socketService.send(MatchEvents.NextQuestion, this.matchHandler.accessCode);
            this.gameLogicService.timerState = TimerState.RUNNING;
            const dialogInfo: DialogData = { message: 'Question suivante dans', duration: 3 };
            const transitionDialog = this.dialog.open(TransitionDialogComponent, { data: dialogInfo, disableClose: true });
            transitionDialog.afterClosed().subscribe(() => {
                this.zone.run(() => {
                    this.gameLogicService.currentQuestionIndex++;
                    this.currentQuestion = this.matchHandler.game.questions[this.gameLogicService.currentQuestionIndex];
                    this.updateHistogram(this.gameLogicService.currentQuestionIndex);
                });
            });
        } else {
            this.socketService.send(MatchEvents.ShowResults, this.matchHandler.accessCode);
            this.gameLogicService.isGameOver = true;
            this.dialog.closeAll();
            this.zone.run(() => {
                this.router.navigate(['/game/results']);
            });
        }
        this.usersAnswersSubmitted = false;
    }

    canSwitchTimerState(newState: TimerState): boolean {
        switch (newState) {
            case TimerState.RUNNING:
                return this.gameLogicService.timerState === TimerState.PAUSED;
            case TimerState.PAUSED:
                return this.gameLogicService.timerState === TimerState.RUNNING;
            case TimerState.PANIC:
                return (
                    this.gameLogicService.timerState === TimerState.RUNNING &&
                    ((this.gameLogicService.timeLeft <= PANIC_MODE_ACTIVATION_TIME_QCM && this.currentQuestion.type === 'QCM') ||
                        (this.gameLogicService.timeLeft <= PANIC_MODE_ACTIVATION_TIME_QRL && this.currentQuestion.type === 'QRL'))
                );
            default:
                return false;
        }
    }

    changeTimerState(newState: TimerState) {
        this.socketService.send(MatchEvents.ChangeTimerState, { accessCode: this.matchHandler.accessCode, timerState: newState });
    }

    remainingTime(): number {
        if (this.currentQuestion.type === 'QCM') return REMAINING_TIME_QCM;
        return REMAINING_TIME_QRL;
    }

    giveUp(): void {
        this.socketService.disconnect();

        this.router.navigate(['/home']);
    }
}
