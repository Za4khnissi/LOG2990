import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME } from './chat.gateway.constants';
import { ChatEvents } from './chat.gateway.events';
import { GameManager } from './../../services/game-manager/game-manager.service';

@WebSocketGateway({ cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    private gameRooms: { [roomId: string]: string } = {};

    constructor(
        private readonly logger: Logger,
        private readonly gameManager: GameManager,
    ) {
        this.initializeGameRooms();
    }

    @SubscribeMessage(ChatEvents.BroadcastAll)
    broadcastAll(socket: Socket, message: string) {
        const currentTime = new Date().toLocaleTimeString();
        this.server.emit(ChatEvents.MassMessage, `${socket.id}: ${message} [${currentTime}]`);
    }

    @SubscribeMessage(ChatEvents.JoinRoom)
    joinGameRoom(socket: Socket, roomId: string) {
        if (this.gameRooms[roomId]) {
            socket.join(roomId);
        } else {
            this.logger.error(`Room ID ${roomId} is not associated with a game.`);
        }
    }

    @SubscribeMessage(ChatEvents.RoomMessage)
    roomMessage(socket: Socket, data: { message: string; room: string }) {
        const currentTime = new Date().toLocaleTimeString();

        // Vérifiez si le client est dans la salle spécifiée dans les données.
        if (socket.rooms.has(data.room)) {
            this.server.to(data.room).emit(ChatEvents.RoomMessage, `${socket.id}: ${data.message} [${currentTime}]`);
        } else {
            this.logger.error(`User ${socket.id} is not in room ${data.room}. Message not sent.`);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    async handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id} `);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id} `);
    }

    private async initializeGameRooms() {
        try {
            // Attendre la résolution de la promesse
            const gameData = await this.gameManager.getAllGames();

            gameData.forEach((game) => {
                this.gameRooms[game.title] = game.title;
            });
        } catch (error) {
            this.logger.error('Erreur lors de la récupération des jeux :', error);
        }
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
