/* eslint-disable max-lines */
import { HttpClientModule, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CommunicationService } from '@app/services/communication.service';
import { Game } from '@common/definitions';
import { of, throwError } from 'rxjs';
import { GameCreationService } from './game-creation.service';
import SpyObj = jasmine.SpyObj;

describe('GameCreationService', () => {
    let service: GameCreationService;

    let communicationServiceSpy: SpyObj<CommunicationService>;
    const GENERATE_RANDOM_ID = 1113;
    const TIME_RIGHT = 16;
    const TIME_FALSE = 5;
    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getGames', 'addGame', 'editGame', 'deleteGame']);

        communicationServiceSpy.addGame.and.returnValue(of(new HttpResponse<string>({ status: 201, statusText: 'Created' })));
        communicationServiceSpy.editGame.and.returnValue(of(new HttpResponse<string>({ status: 200, statusText: 'Ok' })));
        communicationServiceSpy.getGames.and.returnValue(
            of([
                {
                    id: '1113',
                    title: 'Hello',
                    description: 'World',
                    duration: 15,
                    questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
        expect(rightNameValid[0]).toEqual('Tout est correct');
        expect(rightNameValid[1]).toEqual(true);
    });

    it('should put an invalid name', () => {
        service.gameList = [
            {
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];
        const rightNameInvalid = service.isNameValid('Hello');
        expect(rightNameInvalid[0]).toEqual('Le nom doit etre unique');
        expect(rightNameInvalid[1]).toEqual(false);
    });

    it('should put an very big name', () => {
        const mess =
            // eslint-disable-next-line max-len
            "L'un a besoin de l'autre : le capital n'est rien sans le travail, le travail rien sans le capital.Le capital est seulement le fruit du travail et il n'aurait jamais pu exister si le travail n'avait tout d'abord existé.";
        const rightNameInvalid = service.isNameValid(mess);
        expect(rightNameInvalid[0]).toEqual('Le nom ne doit pas dépasser 30 caractères');
        expect(rightNameInvalid[1]).toEqual(false);
    });

    it('should call addGame when calling getMessagesFromServer', () => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.sendToServer(expectedMessage);
        expect(communicationServiceSpy.addGame).toHaveBeenCalled();
    });
    it('should call editGame when calling getMessagesFromServer', () => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.putToServer(expectedMessage);
        expect(communicationServiceSpy.editGame).toHaveBeenCalled();
    });

    it('should provide an Observable of games when games$ is called', (done) => {
        const expectedGames: Game[] = [
            {
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];

        service.games = expectedGames;
        service.games$.subscribe((games) => {
            expect(games).toEqual(expectedGames);
            done();
        });
    });

    it('should set idExist to false when editing a game with the same id', () => {
        const gameToEdit: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };

        service.selectedGameFunc = gameToEdit;
        service.modify();
        const result = service.isIdValid('1113');
        expect(result).toEqual(['Correct', true]);
    });

    it('should call set of gameList', () => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service['games'] = [
            {
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];
        expect(service.gameList[0]).toEqual(expectedMessage);
    });

    it('should set errorMessageSendToServer when sendToServer fails', () => {
        const errorResponse = new Error('Network error');
        // eslint-disable-next-line deprecation/deprecation
        communicationServiceSpy.addGame.and.returnValue(throwError(errorResponse));

        service.sendToServer({} as Game);
        expect(service.errorMessageSendToServer).toContain('Error creating game: Error: Network error');
    });

    it('should set errorMessageSendToServerPutToServer when putToServer fails', () => {
        const errorResponse = new Error('Network error');
        // eslint-disable-next-line deprecation/deprecation
        communicationServiceSpy.editGame.and.returnValue(throwError(errorResponse));

        service.putToServer({} as Game);

        expect(service.errorMessageSendToServerPutToServer).toContain('Error updating game: Error: Network error');
    });

    it('should call set and get of selectedGame', () => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, no-unused-expressions
        (service['selectedGameFunc'] = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        }),
            expect(service.selectedGame).toEqual(expectedMessage);
        expect(service['selectedGameFunc']).toEqual(expectedMessage);
    });

    it('should call a isnamevalid in checkAllAndSubmit ', (done) => {
        const spyNameValid = spyOn(service, 'isNameValid').and.returnValue(['Le nom doit etre unique', false]);
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
        const spyTimeValid = spyOn(service, 'isTimeValid').and.returnValue(['Correct', true]);
        service.gameList = [
            {
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];
        service.checkAllAndSubmit(service.gameList[0]).subscribe(() => {
            expect(spyTimeValid).toHaveBeenCalled();
            expect(spyTimeValid).toHaveBeenCalledOnceWith(service.gameList[0].duration);
            done();
        });
    });

    it('should call a generateid in checkAllAndSubmit ', (done) => {
        service.gameList = [
            {
                id: '1113',
                title: 'Hello',
                description: 'World',
                duration: 15,
                questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
                lastModification: '23-01-2332',
                visible: true,
            },
        ];
        spyOn(service, 'isTimeValid').and.returnValue(['Correct', true]);
        spyOn(service, 'isNameValid').and.returnValue(['Correct', true]);
        spyOn(service, 'isIdValid').and.returnValue(['Correct', true]);
        const spyGenerateId = spyOn(service, 'generateId').and.returnValue(GENERATE_RANDOM_ID);

        service.checkAllAndSubmit(service.gameList[0]).subscribe(() => {
            expect(spyGenerateId).toHaveBeenCalled();
            expect(service.gameList[0].id).toEqual(GENERATE_RANDOM_ID.toString());
            done();
        });
    });

    it('should put correct information', (done) => {
        communicationServiceSpy.getGames.and.returnValue(of([]));

        const expectedMessage: Game = {
            id: '1113',
            title: 'dqzcq',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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
            id: '1113',
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

    it('should call putToServer on checkAllAndSubmit if it s edit true ', (done) => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'h1jfhjg',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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

    it('should call sendToServer on checkAllAndSubmit if it s edit false ', (done) => {
        communicationServiceSpy.getGames.and.returnValue(of([]));
        const expectedMessage: Game = {
            id: '1113',
            title: 'hjfhjg',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
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

    it('should call deleteGame on delete ', () => {
        const expectedMessage: Game = {
            id: '1113',
            title: 'Hello',
            description: 'World',
            duration: 15,
            questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
            lastModification: '23-01-2332',
            visible: true,
        };
        service.delete(expectedMessage);
        expect(communicationServiceSpy.deleteGame).toHaveBeenCalled();
    });

    it('should set the edit to false when creating a game', () => {
        service.create();
        expect(service.isEdit).toEqual(false);
    });

    it('should validate the edit if it fulfills all the questions', () => {
        service.isEdit = true;

        expect(service.isIdValid('1113')).toEqual(['Correct', true]);
    });

    it('should validate the creation if it fulfills all the questions', () => {
        service.isEdit = false;
        expect(service.isIdValid('1113')).toEqual(['Correct', true]);
    });

    it('should set the edit to true when editing a game', () => {
        service.modify();
        expect(service.isEdit).toEqual(true);
    });
});
