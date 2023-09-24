import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { PasswordService } from '@app/services/password.service';

export interface Games {
    name: string;
    editDate: string; // À changer en date pour après
    visible: boolean;
}

const GAME_DATA_TEST: Games[] = [
    { name: 'SVT', editDate: '2023/05/15', visible: true },
    { name: 'Culture Geek', editDate: '1995/05/15', visible: true },
    { name: 'Hewew', editDate: '1945/09/02', visible: true },
];

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnDestroy {
    displayedColumns: string[] = ['gameSelect', 'gameName', 'gameDate', 'gameOptions', 'gameVisible']; // , 'gameOptions',
    dataSource = new MatTableDataSource<Games>(GAME_DATA_TEST);
    selection = new SelectionModel<Games>(true, []);

    constructor(
        private passwordService: PasswordService,
        private router: Router,
    ) {}

    ngOnDestroy(): void {
        this.passwordService.setLoginState(false);
    }

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    masterToggle() {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
    }

    logSelection() {
        // eslint-disable-next-line no-console
        this.selection.selected.forEach((s) => console.log(s.name));
    }

    // isVisible(game: Games) {
    //     let status = '';
    //     if (game.visible === true) {
    //         return (status = 'Visible');
    //     } else {
    //         return (status = 'Invisible');
    //     }
    // }

    create(): void {
        this.router.navigate(['/game/create']); // Redirige vers la vue de connexion
    }
}
