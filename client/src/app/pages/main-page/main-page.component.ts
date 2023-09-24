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

    joinGame(): void {
        this.router.navigate(['/join-game']); // Redirige vers la vue de connexion
    }

    createGame(): void {
        this.router.navigate(['/game']); // Redirige vers la vue de création
    }

    administerGames(): void {
        this.showModal = true;
    }

    handleCloseModal() {
        this.showModal = false;
    }
}
