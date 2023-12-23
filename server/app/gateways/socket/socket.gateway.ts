import { MatchConcludedEntity } from '@app/schemas/match-concluded.schema';
import { MatchManagerService } from '@app/services/match-manager/match-manager.service';
import { QrlAnswer, TimerState } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private readonly logger: Logger,
        private readonly matchManager: MatchManagerService,
    ) {}

    @SubscribeMessage(MatchEvents.GameJoined)
    handleGameJoined(client: Socket, data: { accessCode: string; username: string }): void {
        this.getMatch(data.accessCode).handleGameJoined(client, data.username);
    }

    @SubscribeMessage(MatchEvents.RoomMessage)
    handleRoomMessage(client: Socket, data: { accessCode: string; message: string }): void {
        this.getMatch(data.accessCode).handleRoomMessage(client, data.message);
    }

    @SubscribeMessage(MatchEvents.StartGame)
    handleStartGame(client: Socket, accessCode: string): void {
        this.getMatch(accessCode).handleStartGame(client);
    }

    @SubscribeMessage(MatchEvents.LeaveGame)
    handleLeaveGame(client: Socket, accessCode: string): void {
        this.getMatch(accessCode).handleQuitGame(client);
    }

    @SubscribeMessage(MatchEvents.SubmitAnswers)
    handleSubmitAnswers(client: Socket, data: { accessCode: string; answer: number[] | string }): void {
        this.getMatch(data.accessCode).handleSubmitAnswers(client, data.answer);
    }

    @SubscribeMessage(MatchEvents.ShowResults)
    handleShowResults(client: Socket, accessCode: string): void {
        const matchConcluded: MatchConcludedEntity = this.getMatch(accessCode).handleShowResults();
        this.matchManager.saveMatchinDB(matchConcluded);
    }

    @SubscribeMessage(MatchEvents.NextQuestion)
    handleNextQuestion(client: Socket, accessCode: string): void {
        this.getMatch(accessCode).handleNextQuestion(client);
    }

    @SubscribeMessage(MatchEvents.CreateWaitingRoom)
    handleCreateWaitingRoom(client: Socket, gameId: string) {
        this.matchManager.createMatch(gameId).then((accessCode) => {
            this.server.to(client.id).emit(MatchEvents.WaitingRoomCreated, accessCode);
            this.getMatch(accessCode).handleMatchCreated(this.server, client);
        });
        return;
    }

    @SubscribeMessage(MatchEvents.LockRoom)
    handleLockRoom(client: Socket, accessCode: string): void {
        this.getMatch(accessCode).handleLockRoom(client);
    }

    @SubscribeMessage(MatchEvents.UnlockRoom)
    handleUnlockRoom(client: Socket, accessCode: string): void {
        this.getMatch(accessCode).handleUnlockRoom(client);
    }

    @SubscribeMessage(MatchEvents.RemovePlayer)
    handleRemoveUser(client: Socket, data: { username: string; accessCode: string }): void {
        this.getMatch(data.accessCode).handleRemovePlayer(client, data.username);
    }

    @SubscribeMessage(MatchEvents.SelectAnswer)
    handleSelectAnswer(client: Socket, data: { accessCode: string; answerIndex: number }): void {
        this.getMatch(data.accessCode).handleSelectAnswer(client, data.answerIndex);
    }

    @SubscribeMessage(MatchEvents.UnselectAnswer)
    handleUnselectAnswer(client: Socket, data: { accessCode: string; answerIndex: number }): void {
        this.getMatch(data.accessCode).handleUnselectAnswer(data.answerIndex);
    }

    @SubscribeMessage(MatchEvents.ChangeTimerState)
    handleChangeTimerState(client: Socket, data: { accessCode: string; timerState: TimerState }): void {
        this.getMatch(data.accessCode).handleChangeTimerState(client, data.timerState);
    }

    @SubscribeMessage(MatchEvents.classificationChange)
    handleChangeClassification(client: Socket, data: { accessCode: string; classification: string; choice: boolean }): void {
        this.getMatch(data.accessCode).handleChangeClassification(data.classification, data.choice);
    }

    @SubscribeMessage(MatchEvents.GradingFinished)
    handleGradingFinished(client: Socket, data: { accessCode: string; qRLAnswers: { [clientId: string]: QrlAnswer } }): void {
        this.getMatch(data.accessCode).handleGradingFinished(data.qRLAnswers);
    }

    @SubscribeMessage(MatchEvents.NewInteraction)
    handleNewInteraction(client: Socket, data: { accessCode: string }): void {
        this.getMatch(data.accessCode).handleInteract(client);
    }

    @SubscribeMessage(MatchEvents.toggleChatLock)
    handleToggleChatLock(client: Socket, data: { accessCode: string; username: string }): void {
        this.getMatch(data.accessCode).handleToggleChatLock(client, data.username);
    }

    afterInit(server: Server): void {
        this.logger.log(`Initialisation du serveur ${server} !`);
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Connexion par l'utilisateur avec id : ${client.id} `);
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${client.id} `);

        for (const match of Object.values(this.matchManager.matches)) {
            const wasInMatch = match.handleQuitGame(client);
            if (wasInMatch) {
                break;
            }
        }
    }

    private getMatch(accessCode: string) {
        const match = this.matchManager.matches[accessCode];
        if (!match) {
            throw new Error('Match not found');
        }
        return match;
    }
}
