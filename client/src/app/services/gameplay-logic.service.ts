import { Injectable } from '@angular/core';
import { PROGRESS } from '@common/constants';
import { Classification, Player, TimeInfo, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { MatchHandlerService } from './match-handler.service';
import { SocketClientService } from './socket.client.service';

@Injectable({
    providedIn: 'root',
})
export class GameplayLogicService {
    timeLeft: number = Infinity;
    progressValue: number = PROGRESS;
    isGameOver: boolean = false;
    currentQuestionIndex: number = 0;
    roomMessages: string[];
    timerState: TimerState = TimerState.RUNNING;
    panicSound: HTMLAudioElement = new Audio('assets/panic.mp3');
    player: Player;
    classificationChoice: string;
    orderChoice: boolean;
    orderChoiceName: boolean;
    orderChoiceScore: boolean;
    orderChoiceState: boolean;
    message: string;
    color: string;
    colorSelect: string;
    constructor(
        private readonly socketService: SocketClientService,
        private matchHandler: MatchHandlerService,
    ) {}

    configureBaseSocketFeatures() {
        this.socketService.on(MatchEvents.RoomMessage, (roomMessage: string) => {
            const currentTime = new Date().toLocaleTimeString();
            roomMessage = `[${currentTime}] - ${roomMessage}`;
            this.roomMessages.push(roomMessage);
        });

        this.socketService.on(MatchEvents.toggleChatLock, (players: Player) => {
            this.player = players;
            this.message = this.player.lockedRoom
                ? 'votre organisateur a désactivé votre accès au chat'
                : 'votre organisateur a activé votre accès au chat';
            this.color = this.player.lockedRoom ? 'red' : 'green';
        });

        this.socketService.on(MatchEvents.classificationChange, (currentClassification: Classification) => {
            let newPlayers: Player[] = this.matchHandler.players.slice();

            switch (currentClassification.classificationType) {
                case 'name':
                    this.orderChoiceName = currentClassification.classificationChoice;
                    newPlayers = newPlayers
                        .slice()
                        .sort((a, b) =>
                            (currentClassification.classificationChoice ? a.username : b.username)
                                .toLowerCase()
                                .localeCompare((currentClassification.classificationChoice ? b.username : a.username).toLowerCase()),
                        );
                    break;
                case 'score':
                    this.orderChoiceScore = currentClassification.classificationChoice;
                    newPlayers = newPlayers
                        .slice()
                        .sort(
                            (a, b) =>
                                (currentClassification.classificationChoice ? b.score - a.score : a.score - b.score) ||
                                (currentClassification.classificationChoice ? a.username : b.username)
                                    .toLowerCase()
                                    .localeCompare((currentClassification.classificationChoice ? b.username : a.username).toLowerCase()),
                        );
                    break;
                case 'state':
                    this.orderChoiceState = currentClassification.classificationChoice;
                    newPlayers = newPlayers.sort(
                        (a, b) =>
                            (currentClassification.classificationChoice ? b.status - a.status : a.status - b.status) ||
                            (currentClassification.classificationChoice ? a.username : b.username)
                                .toLowerCase()
                                .localeCompare((currentClassification.classificationChoice ? b.username : a.username).toLowerCase()),
                    );
                    break;
            }
            if (!newPlayers.every((value, index) => value === this.matchHandler.players[index])) {
                this.matchHandler.players = newPlayers;
            }
        });

        this.socketService.on(MatchEvents.stateColorChange, (players: Player) => {
            this.matchHandler.players = this.matchHandler.players.map((player: Player) => {
                if (player.username === players.username) player.status = players.status;
                return player;
            });
        });

        this.socketService.on(MatchEvents.QuestionCountdown, ({ remainingTime, initialTime }: TimeInfo) => {
            this.timeLeft = remainingTime;
            this.progressValue = (this.timeLeft / initialTime) * PROGRESS;
            if (this.timeLeft === 0) {
                this.panicSound.pause();
            }
        });

        this.socketService.on(MatchEvents.NewTimerState, (newState: TimerState) => {
            this.timerState = newState;
            if (this.timerState === TimerState.PANIC && !this.matchHandler.isOrganizer) {
                this.panicSound.play();
            }
        });
    }

    start() {
        this.panicSound.load();
        this.reset();
        this.configureBaseSocketFeatures();
    }

    reset() {
        this.timeLeft = Infinity;
        this.progressValue = PROGRESS;
        this.isGameOver = false;
        this.currentQuestionIndex = 0;
        this.roomMessages = [];
        this.timerState = TimerState.RUNNING;
        this.orderChoiceName = false;
        this.orderChoiceScore = false;
        this.orderChoiceState = false;
        this.classificationChoice = 'name';
    }
}
