/* eslint-disable max-classes-per-file   */
import { TestBed } from '@angular/core/testing';

import { HttpClientModule } from '@angular/common/http';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { Socket } from 'socket.io-client';
import { CommunicationService } from './communication.service';
import { GameplayLogicService } from './gameplay-logic.service';
import { MatchHandlerService } from './match-handler.service';
import { ResetMatchService } from './reset-match.service';
import { SocketClientService } from './socket.client.service';
import SpyObj = jasmine.SpyObj;

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        // nothing
    }

    override disconnect() {
        // nothing
    }
}

class MatchServiceMock extends MatchHandlerService {
    override reset(): void {
        // nothing
    }
}

class GamelogicserviceMock extends GameplayLogicService {
    override reset(): void {
        // nothing
    }
}

describe('ResetMatchService', () => {
    let service: ResetMatchService;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    let matchmock: MatchServiceMock;
    let socketServiceMock: SocketClientServiceMock;
    let socketHelper: SocketTestHelper;
    let gamelogicmock: GamelogicserviceMock;
    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socketServiceMock.socket = socketHelper as any as Socket;
        matchmock = new MatchServiceMock(socketServiceMock, communicationServiceSpy);
        gamelogicmock = new GamelogicserviceMock(socketServiceMock, matchmock);
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                { provide: MatchHandlerService, useValue: matchmock },
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: GameplayLogicService, useValue: gamelogicmock },
            ],
        });
        service = TestBed.inject(ResetMatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should be reset', () => {
        const spySocket = spyOn(socketServiceMock, 'disconnect');
        const spyLogic = spyOn(gamelogicmock, 'reset');
        const spyMatch = spyOn(matchmock, 'reset');
        service.reset();
        expect(spySocket).toHaveBeenCalled();
        expect(spyLogic).toHaveBeenCalled();
        expect(spyMatch).toHaveBeenCalled();
    });
});
