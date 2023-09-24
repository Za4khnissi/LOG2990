import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { PasswordService } from '@app/services/password.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        private router: Router,
        private passwordService: PasswordService,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.url === '/admin' && !this.passwordService.getLoginState()) {
                    this.router.navigate(['/home']);
                }
            }
        });
    }
}
