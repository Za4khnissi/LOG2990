import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { Question } from '@common/definitions';
import { ChartData } from 'chart.js';

@Component({
    selector: 'app-match-results',
    templateUrl: './match-results.component.html',
    styleUrls: ['./match-results.component.scss'],
})
export class MatchResultsComponent implements OnDestroy, OnInit {
    barChartData: ChartData<'bar'> = {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }],
    };

    legendLabels: { text: string; fillStyle: string }[] = [];
    xAxisLabel: string = '';

    currentQuestionIndex: number;
    currentQuestion: Question;

    constructor(
        private router: Router,
        readonly matchHandler: MatchHandlerService,
        private socketService: SocketClientService,
        private zone: NgZone,
    ) {}

    ngOnInit(): void {
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.matchHandler.game.questions[this.currentQuestionIndex];
        this.loadHistogram(this.currentQuestionIndex);
    }

    loadHistogram(index: number): void {
        const { barChartData, xAxisLabel, legendLabels } = this.matchHandler.setupHistogramData(index, true);
        this.xAxisLabel = xAxisLabel;
        this.legendLabels = legendLabels;
        this.barChartData = { ...barChartData };
    }
    hasNextHistogram(): boolean {
        return this.currentQuestionIndex < this.matchHandler.game.questions.length - 1;
    }

    hasPreviousHistogram(): boolean {
        return this.currentQuestionIndex > 0;
    }

    nextHistogram() {
        if (this.hasNextHistogram()) {
            this.currentQuestionIndex++;
            this.currentQuestion = this.matchHandler.game.questions[this.currentQuestionIndex];
            this.loadHistogram(this.currentQuestionIndex);
        }
    }

    previousHistogram() {
        if (this.hasPreviousHistogram()) {
            this.currentQuestionIndex--;
            this.currentQuestion = this.matchHandler.game.questions[this.currentQuestionIndex];
            this.loadHistogram(this.currentQuestionIndex);
        }
    }

    goHome() {
        this.socketService.disconnect();
        this.zone.run(() => {
            this.router.navigate(['/home']);
        });
        this.currentQuestionIndex = 0;
    }

    ngOnDestroy(): void {
        this.goHome();
    }
}
