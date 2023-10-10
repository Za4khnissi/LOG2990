/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game, Question } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { PasswordService } from '@app/services/password.service';
import { of } from 'rxjs';
import { CreateGameComponent } from './create-game.component';

const dummyQuestion: Question = { text: 'New Question', points: 10, choices: [] };

class MatDialogRefMock {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    close() {}
    afterClosed() {
        return of(dummyQuestion);
    }
}

describe('CreateGameComponent', () => {
    let component: CreateGameComponent;
    let fixture: ComponentFixture<CreateGameComponent>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let passwordServiceSpyObj: jasmine.SpyObj<PasswordService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let dialogRefMock: any;

    const communicationServiceMock = {
        getGames: jasmine.createSpy().and.returnValue(of([])),
        addGame: jasmine.createSpy().and.returnValue(of([])),
        editGame: jasmine.createSpy().and.returnValue(of([])),
        deleteGame: jasmine.createSpy().and.returnValue(of([])),
    };

    beforeEach(async () => {
        dialogRefMock = new MatDialogRefMock();
        mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
        mockDialog.open.and.returnValue(dialogRefMock);
        passwordServiceSpyObj = jasmine.createSpyObj('PasswordService', ['setLoginState']);

        await TestBed.configureTestingModule({
            imports: [MatDialogModule, MatChipsModule, MatIconModule, FormsModule, RouterTestingModule, HttpClientTestingModule],
            declarations: [CreateGameComponent],
            providers: [
                { provide: GameCreationService },
                { provide: CommunicationService, useValue: communicationServiceMock },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: MatDialog, useValue: mockDialog },
                { provide: PasswordService, useValue: passwordServiceSpyObj },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateGameComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should switch to edit mode', () => {
        component.gameCreationService.isEdit = true;
        component.gameCreationService.selectedGame = {} as Game;
        component.ngOnInit();
        expect(component.isEdit).toBe(true);
        expect(component.game).toEqual(component.gameCreationService.selectedGame);
    });

    it('should check time validity', () => {
        const gameCreationServiceSpy = spyOn(component.gameCreationService, 'isTimeValid').and.callThrough();
        component.game.duration = 70;
        component.checkTime();
        expect(component.messtime).toBe('Mettez une durée entre 10 et 60');

        component.game.duration = 5;
        component.checkTime();
        expect(component.messtime).toBe('Mettez une durée entre 10 et 60');

        component.game.duration = 30;
        component.checkTime();
        expect(component.messtime).toBe('Tout est correct');

        expect(gameCreationServiceSpy).toHaveBeenCalledTimes(3);
    });

    it('should check name validity', () => {
        const gameCreationServiceSpy = spyOn(component.gameCreationService, 'isNameValid').and.callThrough();

        component.game.title = 'Test Name';
        component.checkName();
        expect(component.messname).toBe('Correct');

        component.game.title = '';
        component.checkName();
        expect(component.messname).toBe('Mettez un nom valable');

        expect(gameCreationServiceSpy).toHaveBeenCalledTimes(2);
    });

    it('should open dialog', () => {
        component.openDialog();
        expect(mockDialog.open).toHaveBeenCalled();
    });

    it('should add question', () => {
        component.game.questions = [];
        component.openDialog();
        expect(mockDialog.open).toHaveBeenCalled();
        dialogRefMock.close({ text: 'New Question' });
        expect(component.game.questions.length).toBe(1);
    });

    it('should edit question', () => {
        component.game.questions = [{ text: 'Old Question', points: 10, choices: [] }];
        component.editQuestion(0);
        expect(mockDialog.open).toHaveBeenCalled();
        dialogRefMock.close({ text: 'New Question' });
        expect(component.game.questions[0].text).toBe('New Question');
    });

    it('should delete question', () => {
        component.game.questions = [{ text: 'Old Question', points: 10, choices: [] }];
        component.deleteQuestion(0);
        expect(component.game.questions.length).toBe(0);
    });

    it('should rearrange questions', () => {
        const mockEvent: CdkDragDrop<Question[], Question[], unknown> = {
            previousContainer: null!,
            container: null!,
            previousIndex: 0,
            currentIndex: 1,
            item: null!,
            dropPoint: null!,
            isPointerOverContainer: true,
            distance: { x: 0, y: 0 },
            event: new MouseEvent('mock'),
        };

        component.game.questions = [
            { text: 'Question 1', points: 10, choices: [] },
            { text: 'Question 2', points: 10, choices: [] },
        ];

        component.drop(mockEvent);

        expect(component.game.questions[0].text).toBe('Question 2');
        expect(component.game.questions[1].text).toBe('Question 1');
    });

    it('should cancel', inject([Router], (mockRouter: Router) => {
        const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();

        component.cancel();

        expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
    }));

    it('should send game data to the service when submit is called and navigate to admin', inject([Router], () => {
        spyOn(component.gameCreationService, 'isNameValid').and.returnValue(['', true]);
        spyOn(component.gameCreationService, 'isTimeValid').and.returnValue(['', true]);
        spyOn(component.gameCreationService, 'checkAllAndSubmit').and.returnValue(of({ state: true, msg: '' }));
        const navigateSpy = spyOn(component.router, 'navigate').and.stub();

        component.submit();

        expect(component.gameCreationService.checkAllAndSubmit).toHaveBeenCalledWith(component.game);
        expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
    }));

    it('should display an alert when submit is called and the game is invalid', () => {
        spyOn(component.gameCreationService, 'isNameValid').and.returnValue(['', false]);
        spyOn(component.gameCreationService, 'isTimeValid').and.returnValue(['', false]);
        spyOn(component.gameCreationService, 'checkAllAndSubmit').and.returnValue(
            of({
                state: false,
                msg: 'Error',
            }),
        );
        const alertSpy = spyOn(window, 'alert').and.stub();

        component.submit();

        expect(component.gameCreationService.checkAllAndSubmit).toHaveBeenCalledWith(component.game);
        expect(alertSpy).toHaveBeenCalledWith('Error');
    });
});
