import { Component, OnInit, Input, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { LIMIT_MESSAGES_CHARACTERS } from '@app/constantes';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit, AfterViewInit {
    @Input() isGameFocused: boolean;
    @ViewChildren('messageList', { read: ElementRef }) messageList: QueryList<ElementRef>;
    serverMessage: string = '';
    serverClock: Date;
    selectedRoom: string = '';
    currentTime: string = '';

    broadcastMessage = '';
    serverMessages: string[] = [];

    roomMessage = '';
    roomMessages: string[] = [];
    messageTooLong: boolean = false;
    errorMessage: string = 'Le message ne doit pas excéder 200 caractères';

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

        this.chatService.on('massMessage', (broadcastMessage: string) => {
            this.serverMessages.push(broadcastMessage);
        });

        this.chatService.on('roomMessage', (roomMessage: string) => {
            this.roomMessages.push(roomMessage);
        });
    }

    scrollToBottomAfterViewChecked() {
        this.messageList.last.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }

    scrollToBottom() {
        this.messageList.changes.subscribe(() => {
            this.scrollToBottomAfterViewChecked();
        });
    }

    ngAfterViewInit() {
        this.messageList.changes.subscribe(() => {
            this.scrollToBottom();
        });
    }

    broadcastMessageToAll() {
        this.chatService.send('broadcastAll', this.broadcastMessage);
        this.broadcastMessage = '';
    }

    sendToRoom() {
        this.chatService.send('RoomMessage', { accessCode: this.matchHandler.accessCode, message: this.roomMessage });
        this.roomMessage = '';
        this.scrollToBottom();
    }

    isSent(message: string): boolean {
        return !this.roomMessages.includes(message);
    }

    limitMessageLength() {
        if (this.roomMessage.length > LIMIT_MESSAGES_CHARACTERS) {
            this.roomMessage = this.roomMessage.slice(0, LIMIT_MESSAGES_CHARACTERS);
            this.messageTooLong = true;
        } else {
            this.messageTooLong = false;
        }
    }
}
