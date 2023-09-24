import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { Game } from '@common/Game';

const MIN_TIME = 10;
const MAX_TIME = 60;

@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    gameList: Game[] = [];
    constructor(private readonly communicationService: CommunicationService) {}

    get games(): Game[] {
        return this.gameList;
    }

    set games(game: Game[]) {
        this.gameList = game;
    }

    isTimeValid(time: number): [string, boolean] {
        const timeIsValid = time >= MIN_TIME && time <= MAX_TIME;
        if (timeIsValid) {
            return ['Tout est correct', true];
        } else {
            return ['Mettez un chiffre entre 10 et 60', false];
        }
    }

    isNameValid(name: string): [string, boolean] {
        const nameExist = this.games.find((v) => v.name === name) && name !== '';
        if (nameExist) return ['Le nom doit etre unique', nameExist];
        else if (name === '') return ['Mettez un nom valable', false];
        else return ['Correct', true];
    }

    sendToServer(game: Game): void {
        this.communicationService.basicPost(game).subscribe();
    }

    putToServer(game: Game): void {
        this.communicationService.basicPut(game).subscribe();
    }
}
