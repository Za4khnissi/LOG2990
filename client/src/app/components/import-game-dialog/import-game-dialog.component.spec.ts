import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { of } from 'rxjs';
import { ImportGameDialogComponent } from './import-game-dialog.component';
import testQuizz from './quiz-example.json';

const TIMEOUTVAL = 100;

describe('ImportGameDialogComponent', () => {
    let component: ImportGameDialogComponent;
    let fixture: ComponentFixture<ImportGameDialogComponent>;
    let communicationService: jasmine.SpyObj<CommunicationService>;
    let gameCreationService: jasmine.SpyObj<GameCreationService>;
    let dialogRef: jasmine.SpyObj<MatDialogRef<ImportGameDialogComponent>>;

    beforeEach(async () => {
        communicationService = jasmine.createSpyObj('CommunicationService', ['getGames']);
        gameCreationService = jasmine.createSpyObj('GameCreationService', [
            'isNameValid',
            'isTimeValid',
            'isIdValid',
            'fetchGamesFromServer',
            'checkAll',
        ]);
        dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

        await TestBed.configureTestingModule({
            declarations: [ImportGameDialogComponent],
            providers: [
                { provide: CommunicationService, useValue: communicationService },
                { provide: GameCreationService, useValue: gameCreationService },
                { provide: MatDialogRef, useValue: dialogRef },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ImportGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        gameCreationService = TestBed.inject(GameCreationService) as jasmine.SpyObj<GameCreationService>;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should close dialog on onCancel', () => {
        component.onCancel();
        expect(dialogRef.close).toHaveBeenCalled();
    });
    it('should set errorMessage on onImport if no game is imported', () => {
        component.onImport();
        expect(component.errorMessage).toEqual('Aucun jeu importé');
    });

    it('should set errorMessage on onFileSelected if JSON is invalid', (done) => {
        const invalidJsonFile = new Blob(['invalid json'], { type: 'application/json' });
        const fileEvent = {
            target: {
                files: [invalidJsonFile],
            },
        } as unknown as Event;

        component.onFileSelected(fileEvent);

        setTimeout(() => {
            expect(component.errorMessage).toEqual('Invalid JSON file');
            done();
        }, TIMEOUTVAL);
    });

    // avec aide de chatGPT
    it('should set errorMessage on onFileSelected if quiz format is invalid', (done) => {
        const invalidQuizFormat = JSON.stringify({ id: 1, title: 'Invalid Quiz' });
        const invalidQuizFile = new Blob([invalidQuizFormat], { type: 'application/json' });
        const fileEvent = {
            target: {
                files: [invalidQuizFile],
            },
        } as unknown as Event;

        spyOn(component, 'convertToGame').and.callThrough();
        component.onFileSelected(fileEvent);

        setTimeout(() => {
            expect(component.errorMessage).toEqual('Invalid quiz format');
            expect(component.convertToGame).not.toHaveBeenCalled();
            done();
        }, TIMEOUTVAL);
    });

    // avec aide de chatGPT
    it('should not set errorMessage and should import game on valid JSON', (done) => {
        const validQuizFormat = JSON.stringify(testQuizz);
        const validQuizFile = new Blob([validQuizFormat], { type: 'application/json' });
        const fileEvent = {
            target: {
                files: [validQuizFile],
            },
        } as unknown as Event;

        spyOn(component, 'convertToGame').and.callThrough();
        component.onFileSelected(fileEvent);

        setTimeout(() => {
            expect(component.errorMessage).toEqual('');
            expect(component.convertToGame).toHaveBeenCalled();
            expect(component.importedGame.title).toEqual('Questionnaire sur le JS');
            done();
        }, TIMEOUTVAL);
    });

    it('should set errorMessage on onImport if name is invalid', () => {
        gameCreationService.checkAll = jasmine.createSpy().and.returnValue(of({ state: false, msg: 'invalid name' }));
        component.importedGame = { title: '', description: '', duration: 10, questions: [], id: '', lastModification: '', visible: false };
        component.onImport();

        expect(component.errorMessage).toEqual('invalid name');
    });

    it('should set errorMessage on onImport if time is invalid', () => {
        gameCreationService.checkAll.and.returnValue(of({ state: false, msg: 'invalid time' }));
        const validImportedGame = {
            id: '',
            title: 'name',
            description: '',
            duration: 10,
            questions: [],
            lastModification: '',
            visible: false,
        };
        component.importedGame = validImportedGame;
        component.onImport();
        expect(component.errorMessage).toEqual('invalid time');
    });

    it('should call onImport if everything is valid', () => {
        gameCreationService.checkAll.and.returnValue(of({ state: true, msg: '' }));
        const validImportedGame = {
            title: 'name',
            description: '',
            duration: 10,
            questions: [],
            id: '',
            lastModification: '',
            visible: false,
        };

        component.importedGame = validImportedGame;

        component.onImport();
        expect(dialogRef.close).toHaveBeenCalledWith(validImportedGame);
    });

    it('should set errorMessage on onFileSelected if no file is selected', () => {
        const noFileEvent = { target: { files: [] } } as unknown as Event;
        component.onFileSelected(noFileEvent);
        expect(component.errorMessage).toEqual('Aucun fichier sélectionné');
    });
});
