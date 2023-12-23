import { HttpClientModule } from '@angular/common/http';
import { ElementRef, QueryList } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatComponent } from '@app/components/chat/chat.component';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { LIMIT_MESSAGES_CHARACTERS } from '@common/constants';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';

describe('ChatComponent', () => {
    const mockGame = jasmine.createSpyObj('Game', ['id', 'title', 'duration', 'questions', 'lastModification']);
    const message = 'Hello, world!';
    const mockChatService = new SocketClientService();
    const fakeQueryList = {
        changes: of(null),
        last: { nativeElement: { scrollIntoView: jasmine.createSpy('scrollIntoView') } },
    };
    let component: ChatComponent;
    let socketServiceMock: SocketClientService;
    let socketHelper: SocketTestHelper;
    let spyChatService = jasmine.createSpyObj('SocketClientService', ['send']);
    let mockMatchHandler = jasmine.createSpyObj('MatchHandlerService', ['checkCode', 'checkUsername', 'configureBaseSocketFeatures', 'accessCode']);
    mockMatchHandler.accessCode.and.returnValue('1234');
    mockMatchHandler.username = 'test';
    mockMatchHandler.isOrganizer = false;
    mockMatchHandler.selectedGameId = '1';
    mockMatchHandler.players = [];
    mockMatchHandler.bannedPlayers = [];
    mockMatchHandler.game = mockGame;
    mockMatchHandler.communicationService = {};
    mockMatchHandler.checkCode.and.returnValue({});
    mockMatchHandler.checkUsername.and.returnValue({});
    mockMatchHandler.configureBaseSocketFeatures.and.returnValue({});

    let mockGameplayLogicService = jasmine.createSpyObj('GameplayLogicService', ['configureBaseSocketFeatures', 'start']);
    mockGameplayLogicService.timeLeft = 0;
    mockGameplayLogicService.progressValue = 0;
    mockGameplayLogicService.isGameOver = false;
    mockGameplayLogicService.currentQuestionIndex = 0;
    mockGameplayLogicService.roomMessages = [];
    mockGameplayLogicService.configureBaseSocketFeatures.and.returnValue({});
    mockGameplayLogicService.start.and.returnValue({});

    beforeEach(async () => {
        component = new ChatComponent(mockChatService, mockMatchHandler, mockGameplayLogicService);
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientService();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        await TestBed.configureTestingModule({
            declarations: [ChatComponent],
            providers: [
                { provide: SocketClientService, useValue: spyChatService },
                { provide: GameplayLogicService, useValue: mockGameplayLogicService },
                { provide: MatchHandlerService, useValue: mockMatchHandler },
            ],
            imports: [FormsModule, HttpClientModule],
        }).compileComponents();
    });

    beforeEach(() => {
        const fixture = TestBed.createComponent(ChatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        spyChatService = TestBed.inject(SocketClientService) as jasmine.SpyObj<SocketClientService>;
        mockMatchHandler = TestBed.inject(MatchHandlerService) as jasmine.SpyObj<MatchHandlerService>;
        mockGameplayLogicService = TestBed.inject(GameplayLogicService) as jasmine.SpyObj<GameplayLogicService>;
    });

    describe('chat', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });
    });

    describe('room', () => {
        it('should send a message to the room ', () => {
            const accessCode = '1234';
            mockMatchHandler.accessCode.and.returnValue(accessCode);
            component.roomMessage = message;
            component.sendToRoom();
            expect(spyChatService.send).toHaveBeenCalled();
            expect(component.roomMessage).toBe('');
        });
    });

    describe('isSent', () => {
        it('should return true if the message has not been sent to the room', () => {
            mockGameplayLogicService.roomMessages = [];
            expect(component.isSent(message)).toBeTrue();
        });

        it('should return false if the message has been sent to the room', () => {
            mockGameplayLogicService.roomMessages = [message];
            expect(component.isSent(message)).toBeFalse();
        });
    });

    describe('limitMessageLength', () => {
        it('should limit the message length to LIMIT_MESSAGES_CHARACTERS', () => {
            component.roomMessage = 'a'.repeat(LIMIT_MESSAGES_CHARACTERS);
            component.limitMessageLength();
            expect(component.roomMessage.length).toEqual(LIMIT_MESSAGES_CHARACTERS);
        });

        it('should set isMessageTooLong to true if the message is too long', () => {
            component.roomMessage = 'a'.repeat(LIMIT_MESSAGES_CHARACTERS);
            component.limitMessageLength();
            expect(component.isMessageTooLong).toBeTrue();
        });

        it('should set isMessageTooLong to false if the message is not too long', () => {
            component.roomMessage = 'a'.repeat(LIMIT_MESSAGES_CHARACTERS - 1);
            component.limitMessageLength();
            expect(component.isMessageTooLong).toBeFalse();
        });

        it('should return true if the message length is greater than or equal to LIMIT_MESSAGES_CHARACTERS', () => {
            component.roomMessage = 'a'.repeat(LIMIT_MESSAGES_CHARACTERS);
            expect(component.isInputDisabled).toBeTrue();
        });
    });

    describe('scroll bar', () => {
        it('should scroll to the bottom of the message list', () => {
            const messageList = {
                last: {
                    nativeElement: {
                        scrollIntoView: jasmine.createSpy('scrollIntoView'),
                    },
                },
            } as QueryList<ElementRef>;
            component.messageList = messageList;
            component.scrollToBottomAfterViewChecked();
            expect(messageList.last.nativeElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
        });

        it('should scroll to the bottom of the message list', () => {
            const spy = spyOn(component, 'scrollToBottom');
            component.messageList = fakeQueryList as QueryList<ElementRef>;
            component.scrollToBottom();
            expect(spy).toHaveBeenCalled();
        });

        it('should call scrollToBottom', () => {
            const spy = spyOn(component, 'scrollToBottomAfterViewChecked');
            component.messageList = fakeQueryList as QueryList<ElementRef>;
            component.ngAfterViewInit();
            expect(spy).toHaveBeenCalled();
        });
    });
});
