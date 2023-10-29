import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    showModal: boolean = false;
    showModalAccess: boolean = false;
    showModalUser: boolean = false;
    showModalName: boolean = false;
    constructor(private router: Router) {}

    joinGameParty(): void {
        this.showModalAccess = true;
    }

    createGameParty(): void {
        this.router.navigate(['/games']);
    }

    manageGames(): void {
        this.showModal = true;
        this.showModalAccess = false;
    }

    handleCloseModal() {
        this.showModal = false;
    }

    handleCloseModaAcces() {
        this.showModalAccess = false;
        this.showModalUser = true;
    }

    handleCloseModalUser() {
        this.showModalUser = false;
    }
}
