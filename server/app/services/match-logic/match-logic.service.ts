/* eslint-disable no-prototype-builtins, max-lines */
import { MatchConcludedEntity } from '@app/schemas/match-concluded.schema';
import {
    IMPOSSIBLE_INDEX,
    INTERACTION_TIME_FRAME,
    INTERVAL,
    MAX_TIME,
    MAX_VALUE,
    MID_VALUE,
    MIN_VALUE,
    NEXT_QUESTION_TIME,
    PERCENTAGE,
    START_TIME,
} from '@common/constants';
import {
    Classification,
    Game,
    MatchInfo,
    MatchPlayer,
    MatchStatus,
    Player,
    PlayerResult,
    QrlAnswer,
    TimeInfo,
    TimerState,
} from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export class MatchLogicService {
    @WebSocketServer()
    private server: Server;
    matchInfo: MatchInfo;
    classification: Classification = { classificationType: 'name', classificationChoice: false };
    private correctAnswerIndexes: number[] = [];
    private firstToAnswer: Player | undefined;
    private playersResults: { [clientId: string]: PlayerResult } = {};
    private qRLAnswers: { [clientId: string]: QrlAnswer } = {};
    private questionsHistogramData: number[][] = [];
    private organizer: Player = { username: 'Organisateur', score: 0, clientId: '', bonusCount: 0, status: MatchPlayer.NO_TOUCH, lockedRoom: false };

    private lastTimestamps: { [clientId: string]: number } = {};

    private initialPlayerCount = 0;
    private previousRoomStatus: MatchStatus | null = null;

    private game: Game;
    private timer: ReturnType<typeof setInterval>;
    private timerDecreaseFactor = 1;

    constructor(matchInfo: MatchInfo, game: Game) {
        this.matchInfo = matchInfo;
        this.game = game;
    }

    handleMatchCreated(server: Server, client: Socket): void {
        this.server = server;
        this.joinRoom(client, this.matchInfo.id);
        this.organizer.clientId = client.id;
    }

    handleGameJoined(client: Socket, username: string) {
        this.joinRoom(client, this.matchInfo.id);
        const newPlayer: Player = { username, score: 0, clientId: client.id, bonusCount: 0, status: MatchPlayer.NO_TOUCH, lockedRoom: false };
        this.matchInfo.players.push(newPlayer);
        this.emitToRoom(MatchEvents.UpdatePlayers, this.matchInfo.players);
    }

    handleRoomMessage(client: Socket, message: string) {
        if (client.rooms.has(this.matchInfo.id)) {
            const player: Player | undefined = this.matchInfo.players.find((player_) => player_.clientId === client.id);
            const username = client.id === this.organizer.clientId ? 'Organisateur' : player?.username;
            this.emitToRoom(MatchEvents.RoomMessage, `${username} : ${message} `);
        }
        return;
    }

    handleStartGame(client: Socket) {
        if (!this.isOrganizer(client)) {
            return;
        }

        this.initialPlayerCount = this.matchInfo.players.length;
        this.emitToRoom(MatchEvents.GameStarted, {});
        setTimeout(() => {
            this.emitQuestionCountdown();
        }, START_TIME);
    }

    handleSelectAnswer(client: Socket, selectedAnswerIndex: number) {
        const player = this.findPlayerById(client.id);
        this.questionsHistogramData[this.matchInfo.currentQuestionIndex][selectedAnswerIndex]++;
        this.server.to(this.organizer.clientId).emit(MatchEvents.AnswerSelected, selectedAnswerIndex);
        player.status = MatchPlayer.SELECT;
        this.server.to(this.organizer.clientId).emit(MatchEvents.stateColorChange, player);
    }

    handleUnselectAnswer(selectedAnswerIndex: number) {
        this.server.to(this.organizer.clientId).emit(MatchEvents.AnswerUnselected, selectedAnswerIndex);
        this.questionsHistogramData[this.matchInfo.currentQuestionIndex][selectedAnswerIndex]--;
    }

    handleSubmitAnswers(client: Socket, selectedAnswer: number[] | string) {
        const player = this.findPlayerById(client.id);
        if (!player) {
            return;
        }

        if (this.timer != null) {
            player.status = MatchPlayer.FINISHED;
            this.server.to(this.organizer.clientId).emit(MatchEvents.stateColorChange, player);
        }
        switch (this.game.questions[this.matchInfo.currentQuestionIndex].type) {
            case 'QCM':
                if (Array.isArray(selectedAnswer)) this.handleQCMAnswer(player, selectedAnswer);
                break;
            case 'QRL':
                this.handleQRLAnswer(player, selectedAnswer.toString());
                break;
        }
    }

    handleQRLAnswer(player: Player, selectedAnswer: string) {
        const userAnswer: QrlAnswer = { username: player.username, answer: selectedAnswer, grade: 0 };
        this.qRLAnswers[player.clientId] = userAnswer;

        const playerResult: PlayerResult = {
            score: player.score,
            isCorrect: false,
            hasBonus: false,
            correctChoices: [],
        };

        this.playersResults[player.clientId] = playerResult;

        this.checkAndStartGradingQRL();
    }

    handleGradingFinished(qRLAnswers: { [clientId: string]: QrlAnswer }) {
        for (const [clientId, qrlAnswer] of Object.entries(qRLAnswers)) {
            const player = this.findPlayerById(clientId);
            if (!player) continue;
            player.score += (qrlAnswer.grade / MAX_VALUE) * this.game.questions[this.matchInfo.currentQuestionIndex].points;

            this.playersResults[clientId].score = player.score;
            this.playersResults[clientId].isCorrect = qrlAnswer.grade === MAX_VALUE;

            switch (qrlAnswer.grade) {
                case MIN_VALUE:
                    this.questionsHistogramData[this.matchInfo.currentQuestionIndex][0] += 1;
                    break;
                case MID_VALUE:
                    this.questionsHistogramData[this.matchInfo.currentQuestionIndex][1] += 1;
                    break;
                case MAX_VALUE:
                    this.questionsHistogramData[this.matchInfo.currentQuestionIndex][2] += 1;
                    break;
            }
        }

        this.sendResults();
    }

    handleQCMAnswer(player: Player, selectedAnswerIndexes: number[]) {
        const isCorrect = this.isAnswerCorrect(selectedAnswerIndexes);
        const points = this.game.questions[this.matchInfo.currentQuestionIndex].points;

        if (isCorrect) {
            player.score += this.firstToAnswer ? points : points * PERCENTAGE;
            if (!this.firstToAnswer) {
                this.firstToAnswer = player;
                player.bonusCount++;
            }
        }

        const playerResult: PlayerResult = {
            score: player.score,
            isCorrect,
            hasBonus: this.firstToAnswer?.clientId === player.clientId,
            correctChoices: this.correctAnswerIndexes,
        };

        this.playersResults[player.clientId] = playerResult;

        this.checkAndSendResults();
    }

    sendResults() {
        if (this.timer !== null) {
            clearInterval(this.timer);
            this.timer = null;
        }

        for (const [clientId, playerResult] of Object.entries(this.playersResults)) {
            this.server.to(clientId).emit(MatchEvents.PlayerResult, playerResult);
        }

        this.server.to(this.organizer.clientId).emit(MatchEvents.AllPlayersResults, this.matchInfo.players);
        this.emitToRoom(MatchEvents.HistogramsData, this.questionsHistogramData);
    }

    handleNextQuestion(client: Socket) {
        this.matchInfo.players = this.matchInfo.players.map((player: Player) => {
            player.status = MatchPlayer.NO_TOUCH;
            this.emitToRoom(MatchEvents.stateColorChange, player);
            return player;
        });

        if (!this.isOrganizer(client)) {
            return;
        }

        this.matchInfo.currentQuestionIndex++;
        this.emitToRoom(MatchEvents.NextQuestion, this.matchInfo.currentQuestionIndex);
        if (this.timer !== null) clearInterval(this.timer);
        setTimeout(() => {
            this.emitQuestionCountdown();
        }, NEXT_QUESTION_TIME);
    }

    handleQuitGame(client: Socket): boolean {
        if (this.isOrganizer(client)) {
            this.emitToRoom(MatchEvents.OrganizerLeft, {});
            this.matchInfo.status = MatchStatus.LOCKED;
            return true;
        }

        return this.removePlayer(client.id);
    }

    handleChangeClassification(classification: string, choice: boolean): void {
        if (classification) this.classification.classificationType = classification;
        if (choice !== undefined) this.classification.classificationChoice = !choice;
        this.emitToRoom(MatchEvents.classificationChange, this.classification);
    }

    toggleRoomLock(client: Socket, lock: boolean): void {
        if (!this.isOrganizer(client)) return;

        this.previousRoomStatus = lock ? this.matchInfo.status : this.previousRoomStatus;
        this.matchInfo.status = lock ? MatchStatus.LOCKED : this.previousRoomStatus || MatchStatus.WAITING;
        this.emitToRoom(lock ? MatchEvents.RoomLocked : MatchEvents.RoomUnlocked, {});
    }

    toggleRoomLockChat(client: Socket, username: string): void {
        const player = this.findPlayerByUsername(username);
        player.lockedRoom = !player.lockedRoom;
        this.server.to(player.clientId).emit(MatchEvents.toggleChatLock, player);
    }

    handleLockRoom(client: Socket): void {
        this.toggleRoomLock(client, true);
    }

    handleUnlockRoom(client: Socket): void {
        this.toggleRoomLock(client, false);
    }

    handleToggleChatLock(client: Socket, username: string): void {
        this.toggleRoomLockChat(client, username);
    }

    handleRemovePlayer(client: Socket, username: string) {
        if (!this.isOrganizer(client)) return;

        const player = this.findPlayerByUsername(username);
        if (!player) {
            return false;
        }

        return this.removePlayer(player.clientId, true);
    }

    handleShowResults() {
        this.matchInfo.players = this.matchInfo.players.map((player: Player) => {
            player.status = MatchPlayer.NO_TOUCH;
            this.emitToRoom(MatchEvents.stateColorChange, player);
            return player;
        });
        this.emitToRoom(MatchEvents.FinalResults, this.matchInfo.players);
        this.matchInfo.status = MatchStatus.FINISHED;

        const matchConcluded = new MatchConcludedEntity();
        matchConcluded.gameName = this.game.title;
        matchConcluded.initialPlayerCount = this.initialPlayerCount;
        matchConcluded.bestScore = this.matchInfo.players[0] ? this.matchInfo.players[0].score : 0;
        matchConcluded.beginDate = this.matchInfo.beginDate;
        return matchConcluded;
    }

    handleChangeTimerState(client: Socket, timerState: TimerState) {
        if (!this.isOrganizer(client)) return;

        switch (timerState) {
            case TimerState.RUNNING:
                this.timerDecreaseFactor = 1;
                break;
            case TimerState.PAUSED:
                this.timerDecreaseFactor = 0;
                break;
            case TimerState.PANIC:
                this.timerDecreaseFactor = 4;
                break;
        }

        this.emitToRoom(MatchEvents.NewTimerState, timerState);
    }

    handleInteract(client: Socket) {
        const player = this.findPlayerById(client.id);
        if (!player) {
            return;
        }
        player.status = MatchPlayer.SELECT;
        this.server.to(this.organizer.clientId).emit(MatchEvents.stateColorChange, player);

        this.lastTimestamps[client.id] = Date.now();
    }

    sendQRLInteractions() {
        const now = Date.now();
        let interactions = 0;

        for (const timestamp of Object.values(this.lastTimestamps)) {
            if (now - timestamp < INTERACTION_TIME_FRAME) {
                interactions++;
            }
        }

        this.emitToRoom(MatchEvents.QRLInteractionData, interactions);
    }

    emitQuestionCountdown() {
        if (this.matchInfo.currentQuestionIndex >= this.game.questions.length) return;

        const question = this.game.questions[this.matchInfo.currentQuestionIndex];
        if (question.type === 'QCM') {
            this.correctAnswerIndexes = question.choices
                .map((choice, index) => (choice.isCorrect === true ? index : IMPOSSIBLE_INDEX))
                .filter((index) => index !== IMPOSSIBLE_INDEX);
        }

        this.questionsHistogramData[this.matchInfo.currentQuestionIndex] = question.type === 'QRL' ? [0, 0, 0] : question.choices.map(() => 0);
        let questionDuration = question.type === 'QCM' ? this.game.duration : MAX_TIME;

        this.firstToAnswer = undefined;
        this.playersResults = {};
        this.qRLAnswers = {};

        if (this.timer !== null) {
            clearInterval(this.timer);
        }

        this.emitToRoom(MatchEvents.NewTimerState, TimerState.RUNNING);
        this.timerDecreaseFactor = 1;

        this.timer = setInterval(() => {
            questionDuration -= this.timerDecreaseFactor;
            questionDuration = Math.max(questionDuration, 0);
            const payload: TimeInfo = { remainingTime: questionDuration, initialTime: this.game.duration };
            this.emitToRoom(MatchEvents.QuestionCountdown, payload);

            if (question.type === 'QRL') this.sendQRLInteractions();

            if (questionDuration <= 0 && this.timer) {
                if (question.type === 'QCM') this.checkAndSendResults();
                else this.checkAndStartGradingQRL();
                clearInterval(this.timer);
                this.timer = null;
            }
        }, INTERVAL);
    }
    private isOrganizer(client: Socket): boolean {
        return this.organizer.clientId === client.id;
    }

    private joinRoom(client: Socket, room: string): void {
        client.join(room);
    }

    private emitToRoom(event: string, payload: unknown): void {
        this.server.to(this.matchInfo.id).emit(event, payload);
    }

    private removePlayer(clientId: string, blacklist = false): boolean {
        const playerIndex = this.matchInfo.players.findIndex((tempPlayer) => tempPlayer.clientId === clientId);
        if (playerIndex === IMPOSSIBLE_INDEX) {
            return false;
        }

        const player = this.findPlayerById(clientId);
        player.status = MatchPlayer.QUIT;
        this.server.to(this.organizer.clientId).emit(MatchEvents.stateColorChange, player);

        const [player_] = this.matchInfo.players.splice(playerIndex, 1);

        this.emitToRoom(MatchEvents.PlayerRemoved, player_.username);

        if (this.timer !== null) {
            switch (this.game.questions[this.matchInfo.currentQuestionIndex].type) {
                case 'QCM':
                    this.checkAndSendResults();
                    break;
                case 'QRL':
                    this.checkAndStartGradingQRL();
                    break;
            }
        }

        if (blacklist) {
            this.matchInfo.blackList.push(player_.username);
            this.emitToRoom(MatchEvents.UpdateBlackList, this.matchInfo.blackList);
            this.server.to(player_.clientId).emit(MatchEvents.KickedOut, {});
        }
        return true;
    }

    private checkAndSendResults() {
        const hasEveryoneAnswered = this.matchInfo.players.every((player) => this.playersResults.hasOwnProperty(player.clientId));
        if (hasEveryoneAnswered) {
            if (this.timer !== null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.sendResults();
        }
    }

    private checkAndStartGradingQRL() {
        const hasEveryoneAnsweredQRL = this.matchInfo.players.every((player) => this.qRLAnswers.hasOwnProperty(player.clientId));
        if (hasEveryoneAnsweredQRL) {
            if (this.timer !== null) {
                clearInterval(this.timer);
                this.timer = null;
            }

            if (Object.keys(this.qRLAnswers).length > 0) this.server.to(this.organizer.clientId).emit(MatchEvents.qRLAnswersToGrade, this.qRLAnswers);
            else this.sendResults();
            this.emitToRoom(MatchEvents.GradingStarted, {});
        }
    }

    private isAnswerCorrect(selectedAnswerIndexes: number[]): boolean {
        return (
            this.correctAnswerIndexes.length === selectedAnswerIndexes.length &&
            this.correctAnswerIndexes.every((index) => selectedAnswerIndexes.includes(index))
        );
    }

    private findPlayerById(clientId: string): Player | undefined {
        return this.matchInfo.players.find((player) => player.clientId === clientId);
    }

    private findPlayerByUsername(username: string): Player | undefined {
        return this.matchInfo.players.find((player) => player.username.toLowerCase() === username.toLowerCase());
    }
}
