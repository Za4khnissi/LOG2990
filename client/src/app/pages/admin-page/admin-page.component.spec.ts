/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameHistoryComponent } from '@app/components/game-history/game-history.component';
import { ImportGameDialogComponent } from '@app/components/import-game-dialog/import-game-dialog.component';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';
import { Game } from '@common/definitions';
import { BehaviorSubject, from, of } from 'rxjs';
import { AdminPageComponent } from './admin-page.component';

// Some tests have been made with the help ChatGPT
// date pas réglé
describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;
    let gameCreationServiceSpyObj: jasmine.SpyObj<GameCreationService>;
    let passwordServiceSpyObj: jasmine.SpyObj<PasswordService>;
    let matDialog: MatDialog;

    class MatDialogRefMock {
        afterClosed() {
            return of(null);
        }
    }

    const matDialogMock = {
        open: () => new MatDialogRefMock(),
    };

    beforeEach(async () => {
        gameCreationServiceSpyObj = jasmine.createSpyObj('GameCreationService', ['create', 'modify', 'putToServer', 'delete', 'sendToServer']);
        gameCreationServiceSpyObj.gamesObs$ = new BehaviorSubject<Game[]>([]);
        passwordServiceSpyObj = jasmine.createSpyObj('PasswordService', ['setLoginState']);
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent, ImportGameDialogComponent],
            imports: [
                RouterTestingModule,
                HttpClientTestingModule,
                MatDialogModule,
                MatTableModule,
                MatIconModule,
                MatPaginatorModule,
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: GameCreationService, useValue: gameCreationServiceSpyObj },
                { provide: MatDialog, useValue: matDialogMock },
                { provide: PasswordService, useValue: passwordServiceSpyObj },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        matDialog = TestBed.inject(MatDialog);
        gameCreationServiceSpyObj = TestBed.inject(GameCreationService) as jasmine.SpyObj<GameCreationService>;
    });

    it('should create component', () => {
        expect(component).toBeTruthy();
    });

    it('should call ngOnInit and update datasource', async () => {
        const game: Game[] = [
            {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: false,
            },
            {
                id: '43',
                title: 'Sens de rien',
                description: 'Questionnaire sur le sens de rien',
                duration: 10,
                questions: [],
                lastModification: '2001-09-13',
                visible: false,
            },
        ];

        component.ngOnInit();
        gameCreationServiceSpyObj.gamesObs$.next(game);
        expect(component.dataSource.data).toEqual(game);
    });

    it('should call create', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        component.create();
        expect(navigateSpy.calls.first().args[0]).toContain('/game/create');
        expect(gameCreationServiceSpyObj.create).toHaveBeenCalled();
    }));

    it('should call modify', inject([Router], (mockRouter: Router) => {
        const game: Game = {
            id: '',
            title: '',
            description: '',
            duration: 10,
            questions: [],
            lastModification: '',
            visible: false,
        };
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
        component.modify(game);
        expect(navigateSpy.calls.first().args[0]).toContain('/game//modify');
        expect(gameCreationServiceSpyObj.modify).toHaveBeenCalled();
    }));

    it('should toggle visibility', () => {
        const game: Game = {
            id: '',
            title: '',
            description: '',
            duration: 10,
            questions: [],
            lastModification: '',
            visible: false,
        };
        component.toggleVisibility(game);
        expect(game.visible).toEqual(true);
    });

    it('should open import dialog and call sendToServer when a game is imported', async () => {
        const gameToImport: Game = {
            id: '42',
            title: 'Sens de la vie',
            description: 'Questionnaire sur le sens de la vie',
            duration: 10,
            questions: [],
            lastModification: '2001-09-12',
            visible: false,
        };

        spyOn(matDialog, 'open').and.callFake(
            () =>
                ({
                    afterClosed: () => of(gameToImport),
                }) as MatDialogRef<any>,
        );

        component.importDialog();
        await fixture.whenStable();

        expect(gameCreationServiceSpyObj.sendToServer).toHaveBeenCalledWith(gameToImport);
    });

    it('should export game when the selectedGame is set', () => {
        const gameToExport: Game = {
            id: '42',
            title: 'Sens de la vie',
            description: 'Questionnaire sur le sens de la vie',
            duration: 10,
            questions: [],
            lastModification: '2001-09-12',
            visible: false,
        };

        component.gameCreationService.selectedGame = gameToExport;

        const anchorElement = document.createElement('a');

        const setAttributeSpy = spyOn(anchorElement, 'setAttribute').and.stub();
        const clickSpy = spyOn(anchorElement, 'click').and.stub();
        const removeSpy = spyOn(anchorElement, 'remove').and.stub();

        const createElementSpy = spyOn(document, 'createElement').and.returnValue(anchorElement);
        const appendChildSpy = spyOn(document.body, 'appendChild');

        component.exportGame(gameToExport);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(appendChildSpy).toHaveBeenCalled();

        expect(setAttributeSpy).toHaveBeenCalledWith('href', jasmine.any(String));
        expect(setAttributeSpy).toHaveBeenCalledWith('download', gameToExport.title + '.json');
        expect(clickSpy).toHaveBeenCalled();
        expect(removeSpy).toHaveBeenCalled();
    });

    it('should delete a game and update dataSource', async () => {
        const game: Game = {
            id: '42',
            title: 'Sens de la vie',
            description: 'Questionnaire sur le sens de la vie',
            duration: 10,
            questions: [],
            lastModification: '2001-09-12',
            visible: false,
        };

        gameCreationServiceSpyObj.delete.and.returnValue(from(Promise.resolve<Game>({} as Game)));

        component.dataSource.data = [
            {
                id: '43',
                title: 'Sens de rien',
                description: 'Questionnaire sur le sens de rien',
                duration: 10,
                questions: [],
                lastModification: '2001-09-13',
                visible: false,
            },
            game,
        ];

        await component.deleteGame(game);
        expect(gameCreationServiceSpyObj.delete).toHaveBeenCalledWith(game);
        expect(component.dataSource.data).not.toContain(game);
    });

    it('should call unsubscribe() on goBackToMainPage', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();

        const addedSubSpy = spyOn<any>(component.subscription, 'unsubscribe');

        // component.ngOnDestroy();
        // fixture.destroy();
        component.goBackToMainPage();
        expect(addedSubSpy).toHaveBeenCalled();
        expect(passwordServiceSpyObj.setLoginState).toHaveBeenCalledWith(false);
        expect(navigateSpy).toHaveBeenCalledWith(['/home']);
    }));

    it('should open history dialog and subscribe to afterClosed', () => {
        const dialogRefSpyObj = jasmine.createSpyObj({ afterClosed: of(null), close: null });
        spyOn(matDialog, 'open').and.returnValue(dialogRefSpyObj);

        component.openHistory();

        expect(matDialog.open).toHaveBeenCalledWith(GameHistoryComponent);
        expect(dialogRefSpyObj.afterClosed).toHaveBeenCalled();
    });

    it('should ngondestroy', inject([Router], () => {
        component.ngOnDestroy();
        fixture.destroy();

        expect(passwordServiceSpyObj.setLoginState).toHaveBeenCalledWith(false);
    }));
});
