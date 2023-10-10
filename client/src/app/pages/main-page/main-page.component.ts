import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    showModal: boolean = false;
    constructor(private router: Router) {}

    joinGameParty(): void {
        this.router.navigate(['/game/join']);
    }

    createGameParty(): void {
        this.router.navigate(['/games']);
    }

    manageGames(): void {
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }
}
