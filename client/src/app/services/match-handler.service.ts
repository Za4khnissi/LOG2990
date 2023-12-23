import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { BAR_CHART_DATA, IMPOSSIBLE_INDEX, MAX_TEXT_CHOICE, MIN_TEXT_CHOICE } from '@common/constants';
import { Game, MatchApiResponse, MatchInfo, Player } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { ChartData } from 'chart.js';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { SocketClientService } from './socket.client.service';
@Injectable({
    providedIn: 'root',
})
export class MatchHandlerService {
    accessCode: string;
    username: string;
    isOrganizer: boolean;
    selectedGameId: string;
    players: Player[] = [];
    questionHistograms: number[][] = [];
    bannedPlayers: string[] = [];
    withdrawnPlayers: string[] = [];
    hasStarted: boolean;
    game: Game;

    constructor(
        private readonly socketService: SocketClientService,
        private readonly communicationService: CommunicationService,
    ) {}

    checkCode(code: string): Observable<MatchApiResponse<string>> {
        return this.communicationService.checkCode(code).pipe(
            map(
                (response) =>
                    ({
                        body: response.body,
                        status: response.status === HttpStatusCode.Ok && ((this.accessCode = code), true),
                    }) as MatchApiResponse<string>,
            ),
            catchError((error) => of({ status: false, body: error.error })),
        );
    }

    checkUsername(username: string): Observable<MatchApiResponse<string>> {
        return this.communicationService.checkUsername(this.accessCode, username).pipe(
            map((response: HttpResponse<MatchInfo>) => {
                if (response.status === HttpStatusCode.Ok) {
                    this.username = username;
                    this.isOrganizer = false;
                    this.selectedGameId = response.body ? response.body.gameId : this.selectedGameId;
                    this.players = [];
                    this.bannedPlayers = [];
                    this.withdrawnPlayers = [];

                    return { body: response.body?.gameId, status: true } as MatchApiResponse<string>;
                } else {
                    return { body: response.body?.gameId, status: false } as MatchApiResponse<string>;
                }
            }),
            catchError((error) => {
                return of({ status: false, body: error.error }) as Observable<MatchApiResponse<string>>;
            }),
        );
    }

    configureBaseSocketFeatures() {
        this.socketService.connect();

        this.socketService.on(MatchEvents.HistogramsData, (histograms: number[][]) => {
            this.questionHistograms = [...histograms];
        });

        this.socketService.on<Player[]>(MatchEvents.UpdatePlayers, (updatedPlayers: Player[]) => {
            this.players = [...updatedPlayers];
        });

        this.socketService.on<string>(MatchEvents.PlayerRemoved, (removedPlayerUsername: string) => {
            const index = this.players.findIndex((player) => player.username === removedPlayerUsername);
            if (index > IMPOSSIBLE_INDEX) {
                if (this.hasStarted) this.withdrawnPlayers.push(removedPlayerUsername);
                else {
                    this.players = [...this.players.slice(0, index), ...this.players.slice(index + 1)];
                }
            }
        });

        this.socketService.on<string[]>(MatchEvents.UpdateBlackList, (updatedBlackList) => {
            this.bannedPlayers = updatedBlackList;
        });

        if (this.isOrganizer) {
            this.players = [];
            this.bannedPlayers = [];
            this.withdrawnPlayers = [];
            this.hasStarted = false;

            this.socketService.createWaitingRoom(this.selectedGameId);

            this.socketService.on<string>(MatchEvents.WaitingRoomCreated, (accessCode) => {
                if (accessCode) {
                    this.accessCode = accessCode;
                    this.isOrganizer = true;
                } else {
                    alert("Erreur lors de la création de la salle d'attente");
                }
            });
        } else {
            this.socketService.joinWaitingRoom(this.accessCode, this.username);
        }

        this.communicationService.getGameById(this.selectedGameId).subscribe((e) => {
            this.game = e;
        });
    }

    setupHistogramData(
        index: number,
        isResultsPage: boolean,
    ): { barChartData: ChartData<'bar'>; xAxisLabel: string; legendLabels: { text: string; fillStyle: string }[] } {
        const question = this.game.questions[index];

        const barChartData: ChartData<'bar'> = BAR_CHART_DATA;
        let xAxisLabel = '';
        let legendLabels: { text: string; fillStyle: string }[] = [];

        switch (question.type) {
            case 'QCM':
                legendLabels = [
                    { text: 'Correct', fillStyle: 'green' },
                    { text: 'Incorrect', fillStyle: 'red' },
                ];
                xAxisLabel = 'Choix possibles';
                barChartData.labels = question.choices?.map((choice) => {
                    return choice.text.length < MAX_TEXT_CHOICE ? choice.text : choice.text.slice(MIN_TEXT_CHOICE, MAX_TEXT_CHOICE) + '...';
                });
                barChartData.datasets[0].backgroundColor = question.choices?.map((choice) => (choice.isCorrect ? 'green' : 'red'));
                barChartData.datasets[0].data = isResultsPage ? this.questionHistograms[index] : question.choices?.map(() => 0) ?? [];
                break;
            case 'QRL':
                legendLabels = [];
                xAxisLabel = isResultsPage ? 'Points' : 'Interactions';
                barChartData.labels = isResultsPage ? ['0%', '50%', '100%'] : ['A interagi', "N'a pas interagi"];
                barChartData.datasets[0].backgroundColor = isResultsPage ? ['red', 'yellow', 'green'] : ['green', 'red'];
                barChartData.datasets[0].data = isResultsPage ? this.questionHistograms[index] : [0, 0];
                break;
        }
        return { barChartData, xAxisLabel, legendLabels };
    }

    reset() {
        this.accessCode = '';
        this.username = '';
        this.isOrganizer = false;
        this.selectedGameId = '';
        this.players = [];
        this.questionHistograms = [];
        this.bannedPlayers = [];
        this.withdrawnPlayers = [];
        this.hasStarted = false;
    }
}
