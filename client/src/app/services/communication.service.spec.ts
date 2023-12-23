/* eslint-disable @typescript-eslint/no-magic-numbers*/
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { Game, MatchConcluded } from '@common/definitions';
describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    const EXPECTED_MESSAGE: Game = {
        id: '001',
        title: 'Hello',
        description: 'World',
        duration: 15,
        questions: [{ type: 'QCM', text: 'What is the capital of France?', points: 10, choices: [] }],
        lastModification: '23-01-2332',
        visible: true,
    };
    const YEAR = 2013;
    const MONTH = 9;
    const DAY = 23;

    const MATCH_CONCLUED: MatchConcluded = {
        beginDate: new Date(YEAR, MONTH, DAY),
        bestScore: 10,
        gameName: 'Hello',
        initialPlayerCount: 0,
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return all party of this game (HttpClient called once)', () => {
        // check the content of the mocked call
        service.getGames().subscribe({
            next: (response: Game[]) => {
                expect(response[0].id).toEqual(EXPECTED_MESSAGE.id);
                expect(response[0].title).toEqual(EXPECTED_MESSAGE.title);
                expect(response[0].description).toEqual(EXPECTED_MESSAGE.description);
                expect(response[0].duration).toEqual(EXPECTED_MESSAGE.duration);
                expect(response[0].questions).toEqual(EXPECTED_MESSAGE.questions);
                expect(response[0].lastModification).toEqual(EXPECTED_MESSAGE.lastModification);
                expect(response[0].visible).toEqual(EXPECTED_MESSAGE.visible);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush([EXPECTED_MESSAGE]);
    });

    it('should return one party of this game (HttpClient called once)', () => {
        // check the content of the mocked call
        service.getGameById('001').subscribe({
            next: (response: Game) => {
                expect(response.id).toEqual(EXPECTED_MESSAGE.id);
                expect(response.title).toEqual(EXPECTED_MESSAGE.title);
                expect(response.description).toEqual(EXPECTED_MESSAGE.description);
                expect(response.duration).toEqual(EXPECTED_MESSAGE.duration);
                expect(response.questions).toEqual(EXPECTED_MESSAGE.questions);
                expect(response.lastModification).toEqual(EXPECTED_MESSAGE.lastModification);
                expect(response.visible).toEqual(EXPECTED_MESSAGE.visible);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/001`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(EXPECTED_MESSAGE);
    });

    it('should return one history of this game (HttpClient called once)', () => {
        // check the content of the mocked call
        service.getHistory().subscribe({
            next: (response: MatchConcluded[]) => {
                expect(response[0].beginDate).toEqual(MATCH_CONCLUED.beginDate);
                expect(response[0].bestScore).toEqual(MATCH_CONCLUED.bestScore);
                expect(response[0].gameName).toEqual(MATCH_CONCLUED.gameName);
                expect(response[0].initialPlayerCount).toEqual(MATCH_CONCLUED.initialPlayerCount);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/match/history`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush([MATCH_CONCLUED]);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.addGame(EXPECTED_MESSAGE).subscribe({
            next: () => {
                // nothing
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(EXPECTED_MESSAGE);
    });

    it('should not return any message when sending a POST request check code (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.checkCode('5081').subscribe({
            next: () => {
                // nothing
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/match/check/code`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush('5081');
    });

    it('should not return any message when sending a POST request check user (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.checkUsername('5081', 'yo').subscribe({
            next: () => {
                // nothing
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/match/check/username`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush('');
    });

    it('should not return any message when sending a POST request create (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.createMatch('001').subscribe({
            next: () => {
                // nothing
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/match/create`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush('');
    });
    it('should not return any message when sending a PUT request (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.editGame(EXPECTED_MESSAGE).subscribe({});
        const req = httpMock.expectOne(`${baseUrl}/games/${EXPECTED_MESSAGE.id}`);
        expect(req.request.method).toBe('PUT');
        // actually send the request
        req.flush(EXPECTED_MESSAGE);
    });

    it('should handle http error safely', () => {
        service.getGames().subscribe({
            next: (response: Game[]) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should delete (HttpClient called once)', () => {
        service.deleteGame('001').subscribe({
            next: (response: Game) => {
                expect(response.id).toEqual(EXPECTED_MESSAGE.id);
                expect(response.title).toEqual(EXPECTED_MESSAGE.title);
                expect(response.description).toEqual(EXPECTED_MESSAGE.description);
                expect(response.duration).toEqual(EXPECTED_MESSAGE.duration);
                expect(response.questions).toEqual(EXPECTED_MESSAGE.questions);
                expect(response.lastModification).toEqual(EXPECTED_MESSAGE.lastModification);
                expect(response.visible).toEqual(EXPECTED_MESSAGE.visible);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/001`);
        expect(req.request.method).toBe('DELETE');
        req.flush(EXPECTED_MESSAGE);
    });

    it('should resethistory (HttpClient called once)', () => {
        service.resetHistory().subscribe({
            next: () => {
                // nothing
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/match/history`);
        expect(req.request.method).toBe('DELETE');
        req.flush(MATCH_CONCLUED);
    });

    it('should handle http delete error safely', () => {
        service.deleteGame('001').subscribe({
            next: (response: Game) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/games/001`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Random error occurred'));
    });
});
