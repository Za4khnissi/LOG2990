import { AfterViewInit, Component, ElementRef, Input, QueryList, ViewChildren } from '@angular/core';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { LIMIT_MESSAGES_CHARACTERS } from '@common/constants';
import { Player } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
    @ViewChildren('messageList', { read: ElementRef }) messageList: QueryList<ElementRef>;
    @Input() player: Player;
    limitMessagesCharacters = LIMIT_MESSAGES_CHARACTERS;
    roomMessage = '';
    isMessageTooLong: boolean = false;
    errorMessage: string = 'Le message ne doit pas excéder 200 caractères';

    constructor(
        public chatService: SocketClientService,
        private matchHandler: MatchHandlerService,
        public gameLogicService: GameplayLogicService,
    ) {}

    get isInputDisabled(): boolean {
        return this.roomMessage.length >= LIMIT_MESSAGES_CHARACTERS;
    }

    shouldDisableButton(): boolean {
        return this.isMessageTooLong || this.gameLogicService.player?.lockedRoom;
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

    sendToRoom() {
        if (!this.isMessageTooLong && this.roomMessage.trim() !== '' && !this.gameLogicService?.player?.lockedRoom) {
            this.chatService.send(MatchEvents.RoomMessage, { accessCode: this.matchHandler.accessCode, message: this.roomMessage });
            this.roomMessage = '';
            this.scrollToBottom();
        }
    }

    isSent(message: string): boolean {
        return !this.gameLogicService.roomMessages.includes(message);
    }

    limitMessageLength() {
        this.isMessageTooLong = this.roomMessage.length >= LIMIT_MESSAGES_CHARACTERS;
        if (this.isMessageTooLong) {
            this.roomMessage = this.roomMessage.slice(0, LIMIT_MESSAGES_CHARACTERS);
        }
    }
}
