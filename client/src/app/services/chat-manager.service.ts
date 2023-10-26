import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatManagerService {
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

    on<T>(event: string, action: (data: T) => void): void {
        this.socket.on(event, action);
    }

    send<T>(event: string, data?: T, callback?: () => void): void {
        this.socket.emit(event, ...[data, callback].filter((x) => x));
    }
}
