import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let router: Router;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have showModal initially as false', () => {
        expect(component.showModal).toBeFalse();
    });

    it('should navigate to /join-game on joinGameParty()', () => {
        component.joinGameParty();
        expect(router.navigate).toHaveBeenCalledWith(['/game/join']);
    });

    it('should navigate to /games on createGameParty()', () => {
        component.createGameParty();
        expect(router.navigate).toHaveBeenCalledWith(['/games']);
    });

    it('should set showModal to true on manageGames()', () => {
        component.manageGames();
        expect(component.showModal).toBeTrue();
    });

    it('should set showModal to false on handleCloseModal()', () => {
        component.showModal = true;
        component.handleCloseModal();
        expect(component.showModal).toBeFalse();
    });
});
