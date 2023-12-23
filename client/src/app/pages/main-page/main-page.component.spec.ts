import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let matDialogSpy: jasmine.SpyObj<MatDialog>;
    let router: Router;

    beforeEach(async () => {
        matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

        await TestBed.configureTestingModule({
            declarations: [MainPageComponent],
            providers: [
                {
                    provide: Router,
                    useClass: class {
                        navigate = jasmine.createSpy('navigate');
                    },
                },
                { provide: MatDialog, useValue: matDialogSpy },
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

    it('should navigate to /join-game on joinGameParty()', () => {
        component.joinGameParty();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });

    it('should navigate to /games on createGameParty()', () => {
        component.createGameParty();
        expect(router.navigate).toHaveBeenCalledWith(['/games']);
    });

    it('should set showModal to true on manageGames()', () => {
        component.manageGames();
        expect(matDialogSpy.open).toHaveBeenCalled();
    });
});
