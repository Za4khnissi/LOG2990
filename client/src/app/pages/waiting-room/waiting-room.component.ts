import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game, Player } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { SocketClientService } from '@app/services/socket.client.service';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    isOrganizer: boolean;
    accessCode: string;
    players: Player[] = [];
    player: Player;
    selectedPlayer: Player;
    selectedGame: Game;

    constructor(
        private socketService: SocketClientService,
        private communicationService: CommunicationService,
        private gameCreationService: GameCreationService,
        private router: Router,
    ) {}

    ngOnInit(): void {
        this.socketService.connect();

        this.isOrganizer = this.gameCreationService.isOrganizer;
        this.selectedGame = this.gameCreationService.selectedGame;

        if (this.isOrganizer) {
            this.communicationService.createMatch(this.selectedGame.id).subscribe((response) => {
                const body: string | null = response.body;
                if (body) {
                    this.accessCode = body;
                    this.socketService.joinWaitingRoom(this.accessCode, 'organizer');
                } else {
                    console.error('Error creating match');
                }
            });
        }

        this.socketService.on<Player[]>('updatePlayers', (updatedPlayers) => {
            this.players = updatedPlayers;
        });

        console.log(this.players);

        this.socketService.on<string>('playerRemoved', (removedPlayerUsername) => {
            const index = this.players.findIndex((player) => player.username === removedPlayerUsername);
            if (index > -1) {
                this.players.splice(index, 1);
            }
        });
    }

    lockRoom(): void {
        this.socketService.lockRoom(this.accessCode);
        this.socketService.on<Player[]>('updatePlayers', (updatedPlayers) => {
            this.players = updatedPlayers;
        });
    }

    unlockRoom(): void {
        this.socketService.unlockRoom(this.accessCode);
        this.socketService.on<Player[]>('updatePlayers', (updatedPlayers) => {
            this.players = updatedPlayers;
        });
    }

    excludePlayer(): void {
        if (this.selectedPlayer) {
            this.socketService.removeUser(this.selectedPlayer.username, this.accessCode);
            this.socketService.on<Player[]>('updatePlayers', (updatedPlayers) => {
                this.players = updatedPlayers;
            });
        }
    }

    startGame(): void {
        this.router.navigate([`/game/${this.gameCreationService.selectedGame.id}/${'play'}`]);
    }
}
