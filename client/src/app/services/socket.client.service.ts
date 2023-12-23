import { Injectable } from '@angular/core';
import { MatchEvents } from '@common/socket.events';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class SocketClientService {
    socket: Socket;

    isSocketAlive() {
        return this.socket && this.socket.connected;
    }

    connect() {
        this.socket = io(environment.socketUrl, { transports: ['websocket'], upgrade: false });
    }

    disconnect() {
        if (this.socket) {
            this.socket.removeAllListeners();
            this.socket.disconnect();
        }
    }

    createWaitingRoom(gameId: string): void {
        this.socket.emit(MatchEvents.CreateWaitingRoom, gameId);
    }

    joinWaitingRoom(accessCode: string, username: string) {
        this.socket.emit(MatchEvents.GameJoined, { accessCode, username });
    }

    lockRoom(accessCode: string): void {
        this.socket.emit(MatchEvents.LockRoom, accessCode);
    }

    unlockRoom(accessCode: string): void {
        this.socket.emit(MatchEvents.UnlockRoom, accessCode);
    }

    removeUser(username: string, accessCode: string): void {
        this.socket.emit(MatchEvents.RemovePlayer, { username, accessCode });
    }

    startGame(accessCode: string): void {
        this.socket.emit(MatchEvents.StartGame, accessCode);
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: () => void): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}
