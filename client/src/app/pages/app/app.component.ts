import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { PasswordService } from '@app/services/password.service';
import { ResetMatchService } from '@app/services/reset-match.service';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    private previousUrl: string = '';
    constructor(
        private router: Router,
        private passwordService: PasswordService,
        private resetMatchService: ResetMatchService,
        private dialog: MatDialog,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.url === '/admin' && !this.passwordService.getLoginState()) {
                    this.passwordService.setLoginState(true);
                }
                if (event.url === '/game/create' && !this.passwordService.getLoginState()) {
                    this.passwordService.setLoginState(true);
                }
            } else if (event instanceof NavigationStart) {
                if (this.shouldReset(this.previousUrl, event.url)) {
                    this.resetMatchService.reset();
                }

                this.previousUrl = event.url;
            }
        });
    }

    ngOnInit() {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.dialog.closeAll());
    }

    private shouldReset(previousUrl: string, currentUrl: string): boolean {
        const sourcePages = ['/game/organizer', '/game/results', new RegExp('/game/.+/play'), '/waiting-room'];
        const destinationPages = ['/games', '/home'];
        const isSourcePage = sourcePages.some((page) => (page instanceof RegExp ? page.test(previousUrl) : page === previousUrl));
        const isDestinationPage = destinationPages.includes(currentUrl);

        return isSourcePage && isDestinationPage;
    }
}
