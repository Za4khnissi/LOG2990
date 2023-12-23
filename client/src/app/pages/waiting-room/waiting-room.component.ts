import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TransitionDialogComponent } from '@app/components/transition-dialog/transition-dialog.component';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { Player, DialogData } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { IMPOSSIBLE_INDEX } from '@common/constants';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
    selectedPlayer: Player | null = null;
    roomLocked: boolean = false;
    isGameStarted: boolean = false;

    constructor(
        private socketService: SocketClientService,
        private dialog: MatDialog,
        private router: Router,
        readonly matchHandler: MatchHandlerService,
        public zone: NgZone,
    ) {}

    isPlayerOrganizer(player: Player): boolean {
        return player.username === 'Organisateur';
    }

    ngOnInit(): void {
        this.matchHandler.configureBaseSocketFeatures();

        this.socketService.on(MatchEvents.OrganizerLeft, () => {
            alert("L'organisateur a quitté la salle. Vous serez redirigé vers la page d'accueil.");
            this.router.navigate(['/home']);
        });

        this.socketService.on(MatchEvents.KickedOut, () => {
            alert('Vous avez été expulsé de la partie!');
            this.router.navigate(['/home']);
        });

        this.socketService.on<string>('Error', (errorMessage) => {
            alert(errorMessage);
            this.router.navigate(['/home']);
        });

        this.socketService.on(MatchEvents.GameStarted, () => {
            this.dialog.closeAll();

            const dialogInfo: DialogData = { message: 'La partie commence dans', duration: 5 };

            const transitionDialog = this.dialog.open(TransitionDialogComponent, { data: dialogInfo, disableClose: true });

            this.isGameStarted = true;
            transitionDialog.afterClosed().subscribe(() => {
                if (this.matchHandler.isOrganizer) {
                    this.router.navigate(['/game/organizer']);
                } else {
                    this.router.navigate([`/game/${this.matchHandler.selectedGameId}/play`]);
                }
            });
        });
    }

    lockRoom(): void {
        if (!this.matchHandler.isOrganizer) return;
        this.roomLocked = true;
        this.socketService.lockRoom(this.matchHandler.accessCode);
    }

    unlockRoom(): void {
        if (!this.matchHandler.isOrganizer) return;
        this.roomLocked = false;
        this.socketService.unlockRoom(this.matchHandler.accessCode);
    }

    excludePlayer(player: Player): void {
        if (!this.matchHandler.isOrganizer || !player) return;

        this.socketService.removeUser(player.username, this.matchHandler.accessCode);
        const playerIndex = this.matchHandler.players.indexOf(player);
        if (playerIndex !== IMPOSSIBLE_INDEX) {
            this.matchHandler.players.splice(playerIndex, 1);
        }
    }

    startGame(): void {
        if (!this.matchHandler.isOrganizer) return;

        if (!this.roomLocked) {
            alert('La salle doit être verrouillée avant de commencer le jeu.');
            return;
        }

        this.matchHandler.hasStarted = true;
        this.socketService.startGame(this.matchHandler.accessCode);
    }

    leaveRoom(): void {
        if (!this.isGameStarted) {
            this.socketService.disconnect();
            this.router.navigate(['/home']);
        }
    }

    trackByFn(index: number, player: Player): string {
        return player.username;
    }

    onPlayerSelect(player: Player): void {
        this.selectedPlayer = player;
    }

    ngOnDestroy(): void {
        this.leaveRoom();
    }
}
