import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ImportGameDialogComponent } from '@app/components/import-game-dialog/import-game-dialog.component';
import { Game } from '@app/interfaces/definitions';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';
import { Subscription, firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnDestroy, OnInit {
    displayedColumns: string[] = ['gameName', 'gameDate', 'gameOptions', 'gameVisible'];
    selection = new SelectionModel<Game>(true, []);
    dataSource: MatTableDataSource<Game>;
    subscription: Subscription;

    constructor(
        private passwordService: PasswordService,
        readonly gameCreationService: GameCreationService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.subscription = this.gameCreationService.gamesObs$.subscribe((games) => {
            this.dataSource = new MatTableDataSource<Game>(games);
        });
    }

    ngOnDestroy() {
        this.passwordService.setLoginState(false);
    }

    create(): void {
        this.router.navigate(['/game/create']);
        this.gameCreationService.create();
    }

    modify(game: Game): void {
        this.gameCreationService.selectedGame = game;
        this.gameCreationService.modify();
        this.router.navigate([`/game/${game.id}/modify`]);
    }

    formatDate(isoString: string): string {
        const dateObj = new Date(isoString);

        const date = dateObj.toLocaleDateString('en-GB');
        const time = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        return `${date} ${time}`;
    }

    exportGame(game: Game): void {
        this.gameCreationService.selectedGame = game;
        if (this.gameCreationService.selectedGame) {
            const gameCopy = { ...this.gameCreationService.selectedGame };
            delete gameCopy.visible;

            // found on https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
            const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gameCopy));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute('href', dataStr);
            downloadAnchorNode.setAttribute('download', game.title + '.json');
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        }
    }

    importDialog(): void {
        const dialogRef = this.dialog.open(ImportGameDialogComponent);
        dialogRef.afterClosed().subscribe((importedGame) => {
            if (importedGame) {
                this.gameCreationService.sendToServer(importedGame);
            }
        });
    }

    toggleVisibility(game: Game): void {
        game.visible = !game.visible;
        this.gameCreationService.selectedGame = game;
        this.gameCreationService.putToServer(this.gameCreationService.selectedGame);
    }

    async deleteGame(game: Game): Promise<void> {
        await firstValueFrom(this.gameCreationService.delete(game));
        this.dataSource.data = this.dataSource.data.filter((gameValue) => gameValue !== game);
    }
}
