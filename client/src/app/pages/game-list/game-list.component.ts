import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-list',
    templateUrl: './game-list.component.html',
    styleUrls: ['./game-list.component.scss'],
})
export class GameListComponent implements OnInit {
    games: Game[] = [];
    subscription: Subscription;
    dataSource: MatTableDataSource<Game>;

    constructor(
        private gameCreationService: GameCreationService,
        private router: Router,
        private communicationService: CommunicationService,
    ) {}

    ngOnInit(): void {
        this.subscription = this.gameCreationService.gamesObs$.subscribe((newGames) => {
            this.games = newGames.filter((g) => g.visible);
        });
    }

    selectGame(game: Game, place: string): void {
        this.communicationService.getGames().subscribe((receivedGames) => {
            // find the game in the list of games
            const gameIndex = receivedGames.findIndex((g) => g.id === game.id);

            // if the game is found et visible, select it
            if (gameIndex >= 0 && receivedGames[gameIndex].visible) {
                this.gameCreationService.selectedGame = this.games[gameIndex];
                this.router.navigate([`/game/${this.gameCreationService.selectedGame.id}/${place}`]);
            } else {
                alert("Ce jeu n'est plus disponoble");
            }
            this.games = receivedGames;
        });
    }

    testGame(game: Game): void {
        this.selectGame(game, 'test');
    }

    createGame(game: Game): void {
        this.selectGame(game, 'play');
    }
}
