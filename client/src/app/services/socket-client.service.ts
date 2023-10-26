import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})

export class SocketClientService {

  socket: Socket;

  isSocketAlive() {
    return this.socket && this.socket.connected;
  }

  connect() {
    console.log("zezfrzefzf");
    this.socket = io(environment.url, { transports: ['websocket'], upgrade: false });
    console.log("zezfrzefzf");
  }

  disconnect() {
    this.socket.disconnect();
  }

  on<T>(event: string, action: (data: T) => void): void {
    this.socket.on(event, action);
  }

  send<T>(event: string, data?: T, callback?: Function): void {
    this.socket.emit(event, ...([data, callback].filter(x => x)));
  }

}
