import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { of } from 'rxjs';
import { GameCreationService } from './game-creation.service';
import SpyObj = jasmine.SpyObj;

describe('GameCreationService', () => {
    let service: GameCreationService;

    let communicationServiceSpy: SpyObj<CommunicationService>;
    const GENERATE_RANDOM_ID = 13;
    const TIME_RIGHT = 16;
    const TIME_FALSE = 5;
    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGames', 'addGame', 'editGame', 'deleteGame']);

        communicationServiceSpy.addGame.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));
        communicationServiceSpy.editGame.and.returnValue(of(new HttpResponse<string>({ status: 200, statusText: 'Ok' })));
        communicationServiceSpy.getGames.and.returnValue(
            of([
                {
                    id: '001',
                    title: 'Hello',
                    description: 'World',
                    duration: 15,
                    questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
                    lastModification: '23-01-2332',
                    visible: true,
                },
            ]),
        );

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],

            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        });
        service = TestBed.inject(GameCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should put an valid duration', () => {
        const rightTimeValid = service.isTimeValid(TIME_RIGHT);
        expect(rightTimeValid[0]).toEqual('Tout est correct');
        expect(rightTimeValid[1]).toEqual(true);
    });

    it('should put an invalid duration', () => {
        const rightTmeInvalid = service.isTimeValid(TIME_FALSE);
        expect(rightTmeInvalid[0]).toEqual('Mettez une durée entre 10 et 60');
        expect(rightTmeInvalid[1]).toEqual(false);
    });

    it('should put an empty name', () => {
        const rightNameEmpty = service.isNameValid('');
        expect(rightNameEmpty[0]).toEqual('Mettez un nom valable');
        expect(rightNameEmpty[1]).toEqual(false);
    });

    it('should put an valid name', () => {
        const rightNameValid = service.isNameValid('yo');
        expect(rightNameValid[0]).toEqual('Correct');
        expect(rightNameValid[1]).toEqual(true);
    });

    it('should put an invalid name', () => {
        const rightNameInvalid = service.isNameValid('Hello');
        expect(rightNameInvalid[0]).toEqual('Le nom doit etre unique');
        expect(rightNameInvalid[1]).toEqual(false);
    });

    it('should call addGame when calling getMessagesFromServer', () => {
        const expectedMessage: Game = {
            id: '001',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.sendToServer(expectedMessage);
        expect(communicationServiceSpy.addGame).toHaveBeenCalled();
    });
    it('should call editGame when calling getMessagesFromServer', () => {
        const expectedMessage: Game = {
            id: '001',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.putToServer(expectedMessage);
        expect(communicationServiceSpy.editGame).toHaveBeenCalled();
    });

    it('should call set of gameList', () => {
        const expectedMessage: Game = {
            id: '001',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service['games'] = [
            {
                id: '001',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];
        expect(service.gameList[0]).toEqual(expectedMessage);
    });

    it('should call a isnamevalid in checkAllAndSubmit ', (done) => {
        const spyNameValid = spyOn(service, 'isNameValid').and.returnValue(['Le nom doit etre unique', false]);
        const expectedMessage: Game = {
            id: '001',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };

        service.checkAllAndSubmit(expectedMessage).subscribe(() => {
            expect(spyNameValid).toHaveBeenCalled();
            expect(spyNameValid).toHaveBeenCalledOnceWith(expectedMessage.title);
            done();
        });
    });

    it('should call a timeValid in checkAllAndSubmit ', (done) => {
        const spyTimeValid = spyOn(service, 'isTimeValid').and.returnValue(['Tout est correct', true]);

        service.checkAllAndSubmit(service.gameList[0]).subscribe(() => {
            expect(spyTimeValid).toHaveBeenCalled();
            expect(spyTimeValid).toHaveBeenCalledOnceWith(service.gameList[0].duration);
            done();
        });
    });

    it('should call a generateid in checkAllAndSubmit ', (done) => {
        spyOn(service, 'isTimeValid').and.returnValue(['Tout est correct', true]);
        spyOn(service, 'isNameValid').and.returnValue(['Correct', true]);
        spyOn(service, 'isIdValid').and.returnValue(['Correct', true]);
        const spyGenerateId = spyOn(service, 'generateId').and.returnValue(GENERATE_RANDOM_ID);

        service.checkAllAndSubmit(service.gameList[0]).subscribe(() => {
            expect(spyGenerateId).toHaveBeenCalled();
            expect(service.gameList[0].id).toEqual('13');
            done();
        });
    });

    it('should put correct information', (done) => {
        communicationServiceSpy.getGames.and.returnValue(of([]));

        const expectedMessage: Game = {
            id: '001',
            title: 'dqzcq',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.checkAllAndSubmit(expectedMessage).subscribe((submission) => {
            expect(submission).toEqual({ state: true, msg: '' });
            done();
        });
    });

    it('should put incorrect information of the name', (done) => {
        const expectedMessage: Game = {
            id: '003',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.checkAllAndSubmit(expectedMessage).subscribe((submission) => {
            expect(submission).toEqual({ state: false, msg: 'Le nom doit etre unique\n' });
            done();
        });
    });

    it('should put incorrect information for the duration', (done) => {
        communicationServiceSpy.getGames.and.returnValue(of([]));
        const expectedMessage: Game = {
            id: '002',
            title: 'qdfq',
            description: 'World',
            duration: 70,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };

        service.checkAllAndSubmit(expectedMessage).subscribe((submission) => {
            expect(submission).toEqual({ state: false, msg: 'Mettez une durée entre 10 et 60\n' });
            done();
        });
    });

    it('should put incorrect information for the duration and name', (done) => {
        const expectedMessage: Game = {
            id: '002',
            title: 'Hello',
            description: 'World',
            duration: 70,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };

        service.checkAllAndSubmit(expectedMessage).subscribe((submission) => {
            expect(submission).toEqual({
                state: false,
                msg: 'Le nom doit etre unique\nMettez une durée entre 10 et 60\n',
            });
            done();
        });
    });

    it('should put incorrect information for the question', () => {
        spyOn(service, 'isIdValid').and.returnValue(['Correct', true]);
        const expectedMessage: Game = {
            id: '001',
            title: 'gvhv',
            description: 'World',
            duration: 15,
            questions: [],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.checkAllAndSubmit(expectedMessage).subscribe((submission) => {
            expect(submission).toEqual({ state: false, msg: 'Il faut au moins une question' + '\n' });
        });
    });

    it('should call putToServer ', (done) => {
        const expectedMessage: Game = {
            id: '001',
            title: 'h1jfhjg',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.selectedGame = expectedMessage;
        service.isEdit = true;
        const spyPut = spyOn(service, 'putToServer');

        service.checkAllAndSubmit(expectedMessage).subscribe(() => {
            expect(spyPut).toHaveBeenCalled();
            expect(spyPut).toHaveBeenCalledWith(expectedMessage);
            done();
        });
    });

    it('should call sendToServer ', (done) => {
        communicationServiceSpy.getGames.and.returnValue(of([]));
        const expectedMessage: Game = {
            id: '001',
            title: 'hjfhjg',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.isEdit = false;
        const spySend = spyOn(service, 'sendToServer');
        service.checkAllAndSubmit(expectedMessage).subscribe(() => {
            expect(spySend).toHaveBeenCalled();
            expect(spySend).toHaveBeenCalledWith(expectedMessage);
            done();
        });
    });

    it('should call deleteGame ', () => {
        const expectedMessage: Game = {
            id: '001',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.delete(expectedMessage);
        expect(communicationServiceSpy.deleteGame).toHaveBeenCalled();
    });

    it('should call create()', () => {
        service.create();
        expect(service.isEdit).toEqual(false);
    });

    it('should call modify()', () => {
        service.modify();
        expect(service.isEdit).toEqual(true);
    });
});
