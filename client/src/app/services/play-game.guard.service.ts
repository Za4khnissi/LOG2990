import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatchHandlerService } from './match-handler.service';

@Injectable({
    providedIn: 'root',
})
export class PlayGameGuardService {
    constructor(
        private matchHandlerService: MatchHandlerService,
        private router: Router,
    ) {}

    canActivate(): boolean {
        return this.matchHandlerService.username && this.matchHandlerService.accessCode ? true : (this.router.navigate(['/home']), false);
    }
}
