import { Injectable } from '@angular/core';
import { GameplayLogicService } from './gameplay-logic.service';
import { MatchHandlerService } from './match-handler.service';
import { SocketClientService } from './socket.client.service';

@Injectable({
    providedIn: 'root',
})
export class ResetMatchService {
    constructor(
        private readonly gameLogicService: GameplayLogicService,
        private readonly socketService: SocketClientService,
        private matchHandler: MatchHandlerService,
    ) {}

    reset() {
        this.socketService.disconnect();
        this.gameLogicService.reset();
        this.matchHandler.reset();
    }
}
