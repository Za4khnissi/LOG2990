import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppComponent } from '@app/pages/app/app.component';
import { PasswordService } from '@app/services/password.service';
import { Observable, of } from 'rxjs';

describe('AppComponent', () => {
    let fixture: ComponentFixture<AppComponent>;
    let app: AppComponent;
    let passwordService: PasswordService;
    let passwordServiceSpy: jasmine.SpyObj<PasswordService>;
    let router: Router;

    class RouterStub {
        events = of(new NavigationEnd(1, '/admin', '/admin'));
        navigate = jasmine.createSpy('navigate');
    }

    const mockRouterGameCreate = {
        events: of(new NavigationEnd(1, '/game/create', '/game/create')),
        navigate: jasmine.createSpy('navigate'),
    };

    beforeEach(async () => {
        passwordServiceSpy = jasmine.createSpyObj('PasswordService', ['getLoginState', 'setLoginState']);

        await TestBed.configureTestingModule({
            imports: [AppRoutingModule, RouterTestingModule, HttpClientModule, HttpClientTestingModule],
            declarations: [AppComponent],
            providers: [
                { provide: PasswordService, useValue: passwordServiceSpy },
                { provide: Router, useClass: RouterStub },
                { provide: Router, useValue: mockRouterGameCreate },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AppComponent);
        app = fixture.componentInstance;

        router = TestBed.inject(Router);

        passwordService = TestBed.inject(PasswordService);
        passwordService.setLoginState(false);

        passwordServiceSpy = TestBed.inject(PasswordService) as jasmine.SpyObj<PasswordService>;
    });

    it('should create the app', () => {
        expect(app).toBeTruthy();
    });

    it('should subscribe to router events and set login state when URL is /admin', () => {
        passwordServiceSpy.getLoginState.and.returnValue(false);

        const event = new NavigationEnd(1, '/admin', '/admin');
        (router.events as unknown) = of(event);

        fixture.detectChanges();

        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(true);
    });

    it('should subscribe to router events and set login state when URL is /game/create', () => {
        const navigationEnd = new NavigationEnd(1, '/game/create', '/game/create');

        const navigationEnd$ = of(navigationEnd) as Observable<NavigationEnd>;
        (router.events as Observable<NavigationEnd>) = navigationEnd$;

        passwordServiceSpy.getLoginState.and.returnValue(false);

        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(true);
    });

    it('should not set login state when login state is false', () => {
        passwordServiceSpy.getLoginState.and.returnValue(true);

        fixture.detectChanges();

        expect(passwordServiceSpy.getLoginState).toHaveBeenCalled();
        expect(passwordServiceSpy.setLoginState).toHaveBeenCalledWith(false);
    });
});
