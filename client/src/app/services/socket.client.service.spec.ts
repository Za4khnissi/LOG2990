import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/classes/socket-test-helper';
import { DATA_TEST } from '@common/constants';
import { io, Socket } from 'socket.io-client';
import { SocketClientService } from './socket.client.service';

describe('SocketClientService', () => {
    let service: SocketClientService;
    let socketTestHelper: SocketTestHelper;
    let socketIoSpy: jasmine.SpyObj<typeof io>;
    const accessCode = '456';
    const username = 'test user';
    const event = 'helloWorld';
    const data = [DATA_TEST, undefined];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [SocketClientService, { provide: io, useValue: socketIoSpy }],
        });
        service = TestBed.inject(SocketClientService);
        socketTestHelper = new SocketTestHelper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service.socket = socketTestHelper as any as Socket;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect', () => {
        service.socket = {
            disconnect: () => {
                // nothing
            },
            removeAllListeners: () => {
                // nothing
            },
        } as Socket;

        const spy = spyOn(service.socket, 'disconnect');
        const spyRemoveAllListeners = spyOn(service.socket, 'removeAllListeners').and.callThrough();
        service.disconnect();
        expect(spy).toHaveBeenCalled();
        expect(spyRemoveAllListeners).toHaveBeenCalled();
    });

    it('isSocketAlive should return true if the socket is still connected', () => {
        service.connect();
        service.socket.connected = true;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeTruthy();
    });

    it('isSocketAlive should return false if the socket is no longer connected', () => {
        service.socket.connected = false;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });
    it('isSocketAlive should return false if the socket is not defined', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service.socket as any) = undefined;
        const isAlive = service.isSocketAlive();
        expect(isAlive).toBeFalsy();
    });

    it('should create a waiting room', () => {
        const gameId = '123';
        const spy = spyOn(service.socket, 'emit');
        service.createWaitingRoom(gameId);
        expect(spy).toHaveBeenCalledWith('createWaitingRoom', gameId);
    });

    it('should join a waiting room', () => {
        const spy = spyOn(service.socket, 'emit');
        service.joinWaitingRoom(accessCode, username);
        expect(spy).toHaveBeenCalledWith('GameJoined', { accessCode, username });
    });

    it('should lock a waiting room', () => {
        const spy = spyOn(service.socket, 'emit');
        service.lockRoom(accessCode);
        expect(spy).toHaveBeenCalledWith('lockRoom', accessCode);
    });

    it('should unlock a waiting room', () => {
        const spy = spyOn(service.socket, 'emit');
        service.unlockRoom(accessCode);
        expect(spy).toHaveBeenCalledWith('unlockRoom', accessCode);
    });

    it('should remove a player from a waiting room', () => {
        const spy = spyOn(service.socket, 'emit');
        service.removeUser(username, accessCode);
        expect(spy).toHaveBeenCalledWith('removePlayer', { username, accessCode });
    });

    it('should start a game', () => {
        const spy = spyOn(service.socket, 'emit');
        service.startGame(accessCode);
        expect(spy).toHaveBeenCalledWith('StartGame', accessCode);
    });

    it('should call socket.on with an event', () => {
        const action = () => {
            // traitement quelconque
        };
        const spy = spyOn(service.socket, 'on');
        service.on(event, action);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, action);
    });

    it('should call emit with data when using send', () => {
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data[0]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event, data[0]);
    });

    it('should call emit without data when using send if data is undefined', () => {
        const spy = spyOn(service.socket, 'emit');
        service.send(event, data[1]);
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(event);
    });
});
