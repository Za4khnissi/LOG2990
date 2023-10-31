import { Injectable } from '@angular/core';
import { Game, Submission } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const MIN_TIME = 10;
const MAX_TIME = 60;
const IDCONST = 3000;

@Injectable({
    providedIn: 'root',
})
export class GameCreationService {
    gameList: Game[] = [];
    isEdit: boolean = false;
    selectedGame: Game | null = null;
    gamesObs$ = new BehaviorSubject<Game[]>([]);

    constructor(private readonly communicationService: CommunicationService) {
        this.gameList = [];
        this.fetchGamesFromServer();
    }

    get games(): Game[] {
        return this.gameList;
    }

    get games$() {
        return this.gamesObs$.asObservable();
    }

    set games(games: Game[]) {
        this.gameList = games;
        this.gamesObs$.next(games);
    }

    isTimeValid(time: number): [string, boolean] {
        const timeIsValid = time >= MIN_TIME && time <= MAX_TIME;
        if (timeIsValid) {
            return ['Tout est correct', true];
        } else {
            return ['Mettez une durée entre 10 et 60', false];
        }
    }

    isNameValid(name: string): [string, boolean] {
        let nameExist = this.games.some((v) => v.title === name) && name !== '';

        if (this.isEdit && this.selectedGame?.title === name) {
            nameExist = false;
        }

        if (nameExist) return ['Le nom doit etre unique', false];
        else if (name === '') return ['Mettez un nom valable', false];
        else return ['Correct', true];
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
        this.communicationService.addGame(game).subscribe();
    }

    putToServer(game: Game): void {
        this.communicationService.editGame(game).subscribe();
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
        return Math.floor(Math.random() * IDCONST);
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
                    // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
                    this.isEdit ? this.putToServer(game) : this.sendToServer(game);
                }

                return { state: isInfoCorrect, msg: errorMsg };
            }),
        );
    }

    fetchGamesFromServer(): void {
        this.communicationService.getGames().subscribe((games: Game[]) => {
            this.games = games;
        });
    }
}
