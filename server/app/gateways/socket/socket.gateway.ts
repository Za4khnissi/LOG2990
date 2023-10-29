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

    private rooms: Record<
        string,
        {
            users: string[];
            organizer: string;
            isLocked: boolean;
            bannedUsers: string[];
        }
    > = {};

    constructor(private readonly logger: Logger) {}

    @SubscribeMessage('GameJoined')
    handleGameJoined(client: Socket, data: { accessCode: string; username: string }): WsResponse<unknown> {
        const { accessCode, username } = data;

        // Check if user is banned
        if (this.rooms[accessCode]?.bannedUsers.includes(username)) {
            return { event: 'Error', data: 'You are banned from this room.' };
        }

        client.join(accessCode);

        if (this.rooms[accessCode]) {
            this.rooms[accessCode].users.push(username);
        } else {
            this.rooms[accessCode] = { users: [username], organizer: username, isLocked: false, bannedUsers: [] };
        }

        this.server.to(accessCode).emit('updatePlayers', this.rooms[accessCode].users);

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

    @SubscribeMessage('lockRoom')
    handleLockRoom(client: Socket, data: { accessCode: string }): WsResponse<void> {
        const { accessCode } = data;

        if (this.rooms[accessCode]?.organizer === client.id) {
            this.rooms[accessCode].isLocked = true;
            this.server.to(accessCode).emit('RoomLocked');
        }

        return;
    }

    @SubscribeMessage('unlockRoom')
    handleUnlockRoom(client: Socket, data: { accessCode: string }): WsResponse<void> {
        const { accessCode } = data;

        if (this.rooms[accessCode]?.organizer === client.id) {
            this.rooms[accessCode].isLocked = false;
            this.server.to(accessCode).emit('RoomUnlocked');
        }
        return;
    }

    @SubscribeMessage('removeUser')
    handleRemoveUser(client: Socket, data: { accessCode: string; username: string }): WsResponse<void> {
        const { accessCode, username } = data;

        if (this.rooms[accessCode]?.organizer === client.id) {
            const index = this.rooms[accessCode].users.indexOf(username);
            if (index > -1) {
                this.rooms[accessCode].users.splice(index, 1);
                this.rooms[accessCode].bannedUsers.push(username);
                this.server.to(accessCode).emit('UserRemoved', username);
            }
        }
        return;
    }

    afterInit(server: Server): void {
        console.log('Initialized!');
        // this.checkRoomConnections();
    }

    handleConnection(client: Socket): void {
        this.logger.log(`Connexion par l'utilisateur avec id : ${client.id} `);
    }

    handleDisconnect(client: Socket): void {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${client.id} `);
    }
    async checkRoomConnections() {
        setInterval(() => {}, 5000);
    }
}
