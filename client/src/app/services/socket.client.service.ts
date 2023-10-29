import { Injectable } from '@angular/core';
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
        this.socket.disconnect();
    }

    joinWaitingRoom(roomCode: string, username: string) {
        this.socket.emit('joinWaitingRoom', { roomCode, username });
    }

    lockRoom(roomCode: string): void {
        this.socket.emit('lockRoom', roomCode);
    }

    unlockRoom(roomCode: string): void {
        this.socket.emit('unlockRoom', roomCode);
    }

    removeUser(username: string, roomCode: string): void {
        this.socket.emit('removeUser', { username, roomCode });
    }

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: Function): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}
