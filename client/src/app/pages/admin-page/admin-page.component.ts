import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ImportGameDialogComponent } from '@app/components/import-game-dialog/import-game-dialog.component';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';
import { Game, FormattedDate } from '@common/definitions';
import { Subscription, firstValueFrom } from 'rxjs';
import { ADMIN_PAGE_SIZE_OPTIONS } from '@common/constants';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnDestroy, OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;

    displayedColumns: string[] = ['gameName', 'gameDate', 'gameOptions', 'gameVisible'];
    selection = new SelectionModel<Game>(true, []);
    dataSource: MatTableDataSource<Game>;
    subscription: Subscription;
    formattedDate: FormattedDate = { hour: '2-digit', minute: '2-digit' };
    pageSizeOptions = ADMIN_PAGE_SIZE_OPTIONS;

    constructor(
        private passwordService: PasswordService,
        readonly gameCreationService: GameCreationService,
        private router: Router,
        private dialog: MatDialog,
    ) {}

    ngOnInit() {
        this.subscription = this.gameCreationService.gamesObs$.subscribe((games) => {
            this.dataSource = new MatTableDataSource<Game>(games);
            this.dataSource.paginator = this.paginator;
        });
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
        const time = dateObj.toLocaleTimeString('en-GB', this.formattedDate);

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

    openHistory(): void {
        const dialogRef = this.dialog.open(GameHistoryComponent);
        dialogRef.afterClosed().subscribe();
    }

    goBackToMainPage(): void {
        if (this.subscription) this.subscription.unsubscribe();
        this.passwordService.setLoginState(false);
        this.router.navigate(['/home']);
    }

    ngOnDestroy() {
        this.passwordService.setLoginState(false);
    }
}
