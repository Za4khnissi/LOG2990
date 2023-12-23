import { Injectable } from '@angular/core';
import { CommunicationService } from '@app/services/communication.service';
import { ID_CONST, MAX_NAME_LENGTH, MAX_TIME, MIN_TIME } from '@common/constants';
import { Game, Submission } from '@common/definitions';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    gameList: Game[] = [];
    isEdit: boolean = false;
    gamesObs$ = new BehaviorSubject<Game[]>([]);
    selectedGame: Game;
    errorMessageSendToServerPutToServer: string;
    errorMessageSendToServer: string;

    constructor(private readonly communicationService: CommunicationService) {
        this.fetchGamesFromServer();
    }

    get games(): Game[] {
        return this.gameList;
    }

    get games$() {
        return this.gamesObs$.asObservable();
    }

    get selectedGameFunc(): Game {
        return this.selectedGame;
    }

    set selectedGameFunc(game: Game) {
        this.selectedGame = game;
    }

    set games(games: Game[]) {
        this.gameList = games;
        this.gamesObs$.next(games);
    }

    isTimeValid(time: number): [string, boolean] {
        const timeIsValid = time >= MIN_TIME && time <= MAX_TIME;
        return timeIsValid ? ['Tout est correct', true] : ['Mettez une durée entre 10 et 60', false];
    }

    isNameValid(name: string): [string, boolean] {
        const trimmedName = name.trim();

        let nameExist = this.games.some((game) => game.title.toLowerCase() === trimmedName.toLowerCase()) && trimmedName !== '';

        if (this.isEdit && this.selectedGame?.title === name) {
            nameExist = false;
        }

        if (name.length > MAX_NAME_LENGTH) {
            return [`Le nom ne doit pas dépasser ${MAX_NAME_LENGTH} caractères`, false];
        }

        if (nameExist) return ['Le nom doit etre unique', false];

        if (trimmedName === '') return ['Mettez un nom valable', false];

        if (trimmedName.toLowerCase() === 'all') return ['"all" est un nom de jeu réservé', false];

        return ['Tout est correct', true];
    }

    isIdValid(id: string): [string, boolean] {
        if (this.isEdit) return ['Correct', true];

        let idExist = this.games.some((v) => v.id === id);

        if (this.isEdit && this.selectedGame?.id === id) {
            idExist = false;
        }

        if (idExist) return ["L'id doit etre unique", false];
        else return ['Correct', true];
    }

    sendToServer(game: Game): void {
        this.communicationService.addGame(game).subscribe({
            next: () => {
                this.fetchGamesFromServer();
            },
            error: (error) => {
                this.errorMessageSendToServer = `Error creating game: ${error}`;
            },
        });
    }

    putToServer(game: Game): void {
        this.communicationService.editGame(game).subscribe({
            next: () => {
                this.fetchGamesFromServer();
            },
            error: (error) => {
                this.errorMessageSendToServerPutToServer = `Error updating game: ${error}`;
            },
        });
    }

    create(): void {
        this.isEdit = false;
    }

    modify(): void {
        this.isEdit = true;
    }

    delete(game: Game): Observable<Game> {
        return this.communicationService.deleteGame(`${game.id}`);
    }

    generateId() {
        return Math.floor(Math.random() * ID_CONST);
    }

    checkAll(game: Game): Observable<Submission> {
        return this.communicationService.getGames().pipe(
            map((games: Game[]) => {
                this.games = games;

                // check if game still exists
                this.isEdit = this.isEdit ? this.games.some((v) => v.id === this.selectedGame?.id) : this.isEdit;

                let errorMsg = '';
                let isInfoCorrect = true;

                const isQuestionLengthValid = game.questions.length > 0;
                const isNameValid = this.isNameValid(game.title);
                const isTimeValid = this.isTimeValid(game.duration);
                const isIdValid = this.isIdValid(game.id);

                if (!isNameValid[1]) errorMsg += isNameValid[0] + '\n';
                if (!isTimeValid[1]) errorMsg += isTimeValid[0] + '\n';
                if (!isIdValid[1]) errorMsg += isIdValid[0] + '\n';
                if (!isQuestionLengthValid) errorMsg += 'Il faut au moins une question\n';

                isInfoCorrect = isNameValid[1] && isTimeValid[1] && isIdValid[1] && isQuestionLengthValid;

                return { state: isInfoCorrect, msg: errorMsg };
            }),
        );
    }

    checkAllAndSubmit(game: Game): Observable<Submission> {
        return this.checkAll(game).pipe(
            map((submission: Submission) => {
                const { state: isInfoCorrect, msg: errorMsg } = submission;

                if (!isInfoCorrect) return { state: isInfoCorrect, msg: errorMsg };

                game.id = this.isEdit ? game.id : this.generateId().toString();
                game.lastModification = new Date().toISOString();

                if (isInfoCorrect) {
                    game.visible = false;
                    if (this.isEdit) {
                        this.putToServer(game);
                    } else {
                        this.sendToServer(game);
                    }
                }

                return { state: isInfoCorrect, msg: errorMsg };
            }),
        );
    }

    fetchGamesFromServer(): void {
        this.communicationService.getGames().subscribe((games: Game[]) => {
            this.gamesObs$.next(games);
        });
    }
}
