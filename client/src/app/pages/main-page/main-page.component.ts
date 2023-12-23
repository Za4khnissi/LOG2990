import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalAccesComponent } from '@app/components/modal-access/modal-access.component';
import { ModalAdminComponent } from '@app/components/modal-admin/modal-admin.component';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    constructor(
        private router: Router,
        private dialog: MatDialog,
    ) {}

    joinGameParty(): void {
        this.dialog.open(ModalAccesComponent);
    }

    createGameParty(): void {
        this.router.navigate(['/games']);
    }

    manageGames(): void {
        this.dialog.open(ModalAdminComponent);
    }
}
