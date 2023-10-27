import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatEvents } from './chat.gateway.events';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private rooms: Record<string, string[]> = {};

    constructor(private readonly logger: Logger) {}

    afterInit(server: Server): void {
        console.log('Initialized!');
        //this.checkRoomConnections();
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Connexion par l'utilisateur avec id : ${client.id} `);
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${client.id} `);
    }

    @SubscribeMessage('GameJoined')
    handleGameJoined(client: Socket, data: { accessCode: string; username: string }): WsResponse<void> {
        console.log(data);
        const { accessCode, username } = data;

        client.join(accessCode);

        console.log('New player');
        // if (this.rooms[accessCode]) {
        //   this.rooms[accessCode].push(username);
        // } else {
        //   this.rooms[accessCode] = [username];
        // }

        this.server.to(accessCode).emit('NewUser', username);

        return;
    }

    @SubscribeMessage('RoomMessage')
    handleRoomMessage(client: Socket, data: { accessCode: string; message: string }): WsResponse<void> {
        const { accessCode, message } = data;
        const currentTime = new Date().toLocaleTimeString();

        // Vérifiez si le client est dans la salle spécifiée dans les données.
        if (client.rooms.has(accessCode)) {
            this.server.to(accessCode).emit(ChatEvents.RoomMessage, `${client.id}: ${data.message} [${currentTime}]`);
        } else {
            this.logger.error(`User ${client.id} is not in room ${accessCode}. Message not sent.`);
        }

        return;
    }

    async checkRoomConnections() {
        setInterval(() => {}, 5000);
    }
}
