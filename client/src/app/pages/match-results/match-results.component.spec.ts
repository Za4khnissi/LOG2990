/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line max-classes-per-file
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { ChatComponent } from '@app/components/chat/chat.component';
import { PlayersListComponent } from '@app/components/players-list/players-list.component';
import { CommunicationService } from '@app/services/communication.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { Game, MatchPlayer } from '@common/definitions';
import { Socket } from 'socket.io-client';
import { MatchResultsComponent } from './match-results.component';
import SpyObj = jasmine.SpyObj;

class MatchServiceMock extends MatchHandlerService {
    accessCode: '5091';
    username: 'testname';
    isOrganizer: false;
    selectedGameId: '3';
    players = [];
    bannedPlayers = [];
    game: Game = {
        id: '3',
        title: 'testtitle',
        description: 'description',
        duration: 10,
        questions: [
            {
                type: 'QCM',
                text: '',
                points: 0,
                choices: [
                    {
                        text: 'reponse vrai',
                        isCorrect: true,
                    },
                ],
            },
            {
                type: 'QRL',
                text: ';vn',
                points: 0,
            },
        ],
        lastModification: '',
    };
}

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }
    override disconnect() {
        // nothing
    }
}
describe('MatchResultsComponent', () => {
    let component: MatchResultsComponent;
    let socketHelper: SocketTestHelper;
    let fixture: ComponentFixture<MatchResultsComponent>;
    let matchmock: MatchServiceMock;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    // Mock services

    let socketServiceMock: SocketClientServiceMock;

    beforeEach(async () => {
        socketServiceMock = new SocketClientServiceMock();
        socketHelper = new SocketTestHelper();
        socketServiceMock.socket = socketHelper as any as Socket;
        matchmock = new MatchServiceMock(socketServiceMock, communicationServiceSpy);
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule.withRoutes([]), HttpClientTestingModule, FormsModule, BrowserDynamicTestingModule],
            declarations: [MatchResultsComponent, PlayersListComponent, ChatComponent],
            providers: [
                { provide: MatchHandlerService, useValue: matchmock },
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(MatchResultsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeDefined();
    });

    it('should call to navigate to home', () => {
        const spysocket = spyOn(socketServiceMock, 'disconnect');
        component.goHome();
        expect(spysocket).toHaveBeenCalled();
    });

    it('should call goHome on ngOnDestroy', () => {
        const spyhome = spyOn(component, 'goHome');
        component.ngOnDestroy();
        expect(spyhome).toHaveBeenCalled();
    });

    it('should nextHistogram', () => {
        component.matchHandler.players = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },

            {
                clientId: '4',
                username: 'yop',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        component.currentQuestionIndex = 0;
        const spyLoad = spyOn(component, 'loadHistogram');
        component.nextHistogram();
        expect(component.currentQuestionIndex).toEqual(1);
        expect<any>(component.currentQuestion).toEqual({
            type: 'QRL',
            text: ';vn',
            points: 0,
        });
        expect(spyLoad).toHaveBeenCalledWith(component.currentQuestionIndex);
    });

    it('should previousHistogram', () => {
        component.matchHandler.players = [
            {
                clientId: '3',
                username: 'jack',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },

            {
                clientId: '4',
                username: 'yop',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        component.currentQuestionIndex = 1;
        const spyLoad = spyOn(component, 'loadHistogram');
        component.previousHistogram();
        expect(component.currentQuestionIndex).toEqual(0);
        expect<any>(component.currentQuestion).toEqual({
            type: 'QCM',
            text: '',
            points: 0,
            choices: [
                {
                    text: 'reponse vrai',
                    isCorrect: true,
                },
            ],
        });
        expect(spyLoad).toHaveBeenCalledWith(component.currentQuestionIndex);
    });

    it('should hasNextHistogram true', () => {
        component.currentQuestionIndex = 0;

        expect(component.hasNextHistogram()).toBeTruthy();
    });

    it('should hasNextHistogram false', () => {
        component.currentQuestionIndex = 1;

        expect(component.hasNextHistogram()).toBeFalsy();
    });

    it('should hasPreviousHistogram false', () => {
        component.currentQuestionIndex = 0;

        expect(component.hasPreviousHistogram()).toBeFalsy();
    });
    it('should hasPreviousHistogram true', () => {
        component.currentQuestionIndex = 1;

        expect(component.hasPreviousHistogram()).toBeTruthy();
    });
});
