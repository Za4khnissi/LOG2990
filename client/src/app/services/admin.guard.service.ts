import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PasswordService } from './password.service';

@Injectable({
    providedIn: 'root',
})
export class AdminGuard {
    constructor(
        private router: Router,
        private passwordService: PasswordService,
    ) {}

    canActivateFunc(): boolean {
        return this.passwordService.getLoginState() || (this.router.navigate(['**']), false);
    }
}
