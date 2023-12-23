import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { Game } from '@common/definitions';
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
        public gameCreationService: GameCreationService,
        private matchHandler: MatchHandlerService,
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
            const gameIndex = receivedGames.findIndex((g) => g.id === game.id);
            this.games = receivedGames;
            if (gameIndex >= 0 && receivedGames[gameIndex].visible) {
                this.gameCreationService.selectedGame = this.games[gameIndex];
                if (place === 'test') this.router.navigate([`/game/${this.gameCreationService.selectedGame.id}/${place}`]);
                else this.router.navigate(['/waiting-room']);
            } else {
                alert("Ce jeu n'est plus disponible");
                this.gameCreationService.fetchGamesFromServer();
            }
        });
    }

    testGame(game: Game): void {
        this.selectGame(game, 'test');
    }

    createGame(game: Game): void {
        this.matchHandler.selectedGameId = game.id;
        this.matchHandler.isOrganizer = true;
        this.selectGame(game, 'play');
    }
    goBackToMainPage(): void {
        this.router.navigate(['/home']);
    }
}
