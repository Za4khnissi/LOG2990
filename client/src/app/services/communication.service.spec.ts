import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;
    const EXPECTED_MESSAGE: Game = {
        id: '001',
        title: 'Hello',
        description: 'World',
        duration: 15,
        questions: [{ text: 'What is the capital of France?', points: 10, choices: [] }],
        lastModification: '23-01-2332',
        visible: true,
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
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

        const req = httpMock.expectOne(`${baseUrl}/game/all`);
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

        const req = httpMock.expectOne(`${baseUrl}/game/001`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(EXPECTED_MESSAGE);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.addGame(EXPECTED_MESSAGE).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(EXPECTED_MESSAGE);
    });

    it('should not return any message when sending a PUT request (HttpClient called once)', () => {
        // subscribe to the mocked call
        service.editGame(EXPECTED_MESSAGE).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
        });
        const req = httpMock.expectOne(`${baseUrl}/game/${EXPECTED_MESSAGE.id}`);
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

        const req = httpMock.expectOne(`${baseUrl}/game/all`);
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

        const req = httpMock.expectOne(`${baseUrl}/game/001`);
        expect(req.request.method).toBe('DELETE');
        req.flush(EXPECTED_MESSAGE);
    });
    it('should handle http delete error safely', () => {
        service.deleteGame('001').subscribe({
            next: (response: Game) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/game/001`);
        expect(req.request.method).toBe('DELETE');
        req.error(new ProgressEvent('Random error occurred'));
    });
});
