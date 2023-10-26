import { Component, OnInit } from '@angular/core';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
    serverMessage: string = '';
    serverClock: Date;
    selectedRoom: string = '';
    currentTime: string = '';

    broadcastMessage = '';
    serverMessages: string[] = [];

    roomMessage = '';
    roomMessages: string[] = [];

    constructor(
        public chatService: SocketClientService,
        private matchHandler: MatchHandlerService,
    ) {}

    ngOnInit(): void {
        this.configureBaseSocketFeatures();
    }

    configureBaseSocketFeatures() {
        this.chatService.on('connect', () => {
            // initialisation
        });

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un client connecté
        this.chatService.on('massMessage', (broadcastMessage: string) => {
            this.serverMessages.push(broadcastMessage);
        });

        // Gérer l'événement envoyé par le serveur : afficher le message envoyé par un membre de la salle
        this.chatService.on('roomMessage', (roomMessage: string) => {
            this.roomMessages.push(roomMessage);
        });
    }

    broadcastMessageToAll() {
        this.chatService.send('broadcastAll', this.broadcastMessage);
        this.broadcastMessage = '';
    }

    sendToRoom() {
        this.chatService.send('RoomMessage', { accessCode: this.matchHandler.accessCode, message: this.roomMessage });
        this.roomMessage = '';
    }

    isSent(message: string): boolean {
        return !this.roomMessages.includes(message);
    }
}
