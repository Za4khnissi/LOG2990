/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { BrowserModule } from '@angular/platform-browser';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { PasswordService } from '@app/services/password.service';
import { ResetMatchService } from '@app/services/reset-match.service';
import { Subject } from 'rxjs';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let app: AppComponent;
    let passwordService: PasswordService;
    let passwordServiceSpy: jasmine.SpyObj<PasswordService>;
    let resetServiceSpy: jasmine.SpyObj<ResetMatchService>;
    // let router: Router;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;

    class RouterStub {
        private subject = new Subject<any>();

        get events() {
            return this.subject.asObservable();
        }

        triggerNavigationStart(url: string) {
            const event = new NavigationStart(1, url);
            this.subject.next(event);
        }

        triggerNavigationEnd(url: string, prevUrl: string) {
            const event = new NavigationEnd(1, url, prevUrl);
            this.subject.next(event);
        }
    }

    let routerStub: RouterStub;

    // class RouterStubStart {
    //     events = of(new NavigationStart(2, '/games'));
    //     navigate = jasmine.createSpy('navigate');
    // }
    // const mockRouterGameCreate = {
    //     events: of(new NavigationEnd(1, '/game/create', '/game/create')),
    //     navigate: jasmine.createSpy('navigate'),
    // };

    beforeEach(async () => {
        passwordServiceSpy = jasmine.createSpyObj('PasswordService', ['getLoginState', 'setLoginState']);
        routerStub = new RouterStub();
        resetServiceSpy = jasmine.createSpyObj('ResetMatchService', ['reset']);
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['close', 'closeAll']);

        //  const navigationEvents = of(
        //     new NavigationStart(1, '/home'),
        //     new NavigationEnd(2, '/admin', '/admin')
        // );

        await TestBed.configureTestingModule({
            imports: [AppRoutingModule, RouterTestingModule, HttpClientModule, HttpClientTestingModule, BrowserModule],
            declarations: [AppComponent],
            providers: [
                { provide: PasswordService, useValue: passwordServiceSpy },
                { provide: ResetMatchService, useValue: resetServiceSpy },
                { provide: Router, useValue: routerStub },
                { provide: MatDialog, useValue: matDialogSpy },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;

        //  router = TestBed.inject(Router);

        passwordService = TestBed.inject(PasswordService);
        passwordService.setLoginState(false);

        passwordServiceSpy = TestBed.inject(PasswordService) as jasmine.SpyObj<PasswordService>;
        resetServiceSpy = TestBed.inject(ResetMatchService) as jasmine.SpyObj<ResetMatchService>;
    });
    beforeEach(() => {
        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create the app', () => {
        expect(app).toBeTruthy();
        app['previousUrl'] = '/game/organizer';
    });

    it('should subscribe to router events and set login state when URL is /admin', fakeAsync(() => {
        passwordServiceSpy.getLoginState.and.returnValue(false);
        routerStub.triggerNavigationEnd('/admin', '/admin');

        fixture.detectChanges();
        tick();
        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(true);
    }));

    it('should subscribe to router events and set login state when URL is /game/create', fakeAsync(() => {
        routerStub.triggerNavigationEnd('/game/create', '/game/create');

        passwordServiceSpy.getLoginState.and.returnValue(false);
        tick();
        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(true);
    }));

    it('should not set login state when login state is false', fakeAsync(() => {
        passwordServiceSpy.getLoginState.and.returnValue(true);
        routerStub.triggerNavigationEnd('/game/create', '/game/create');
        fixture.detectChanges();
        tick();
        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(false);
    }));

    it('should shouldreset correect', () => {
        expect(app['shouldReset']('/game/organizer', '/games')).toBeTruthy();

        fixture.detectChanges();
    });

    it('should shouldreset incorrect destnation', () => {
        expect(app['shouldReset']('/game/organizer', '/game/organizer')).toBeFalsy();

        fixture.detectChanges();
    });
    it('should shouldreset incorrect source', () => {
        expect(app['shouldReset']('/games', '/games')).toBeFalsy();

        fixture.detectChanges();
    });

    it('should call resetMatchService.reset when shouldReset is true', fakeAsync(() => {
        app['previousUrl'] = '/game/organizer';
        fixture.whenStable();
        routerStub.triggerNavigationStart('/games');
        tick();
        fixture.detectChanges();
        expect(resetServiceSpy.reset).toHaveBeenCalled();
    }));
});
