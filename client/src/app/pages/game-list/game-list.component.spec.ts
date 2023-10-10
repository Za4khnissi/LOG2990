import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, inject, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game } from '@app/interfaces/definitions';
import { CommunicationService } from '@app/services/communication.service';
import { GameCreationService } from '@app/services/game-creation.service';
import { BehaviorSubject, of } from 'rxjs';
import { GameListComponent } from './game-list.component';

class GameCreationServiceMock {
    selectedGame: Game | null = null;
    private gamesSubject = new BehaviorSubject<Game[]>([]);
    // eslint-disable-next-line @typescript-eslint/member-ordering
    gamesObs$ = this.gamesSubject.asObservable();

    setGames(games: Game[]): void {
        this.gamesSubject.next(games);
    }

    selectGame(game: Game): void {
        this.selectedGame = game;
    }
}

describe('GameListComponent', () => {
    let component: GameListComponent;
    let fixture: ComponentFixture<GameListComponent>;

    let gameCreationServiceMock: GameCreationServiceMock;

    const communicationServiceMock = {
        getGames: jasmine.createSpy().and.returnValue(of([])),
    };

    beforeEach(async () => {
        gameCreationServiceMock = new GameCreationServiceMock();

        TestBed.configureTestingModule({
            declarations: [GameListComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [
                { provide: GameCreationService, useValue: gameCreationServiceMock },
                { provide: CommunicationService, useValue: communicationServiceMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        const game: Game[] = [
            {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: true,
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

        gameCreationServiceMock.setGames(game);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call ngOnInit', async () => {
        expect(component.games).toEqual([
            {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: true,
            },
        ]);
    });

    it('should create game', fakeAsync(
        inject([Router], (mockRouter: Router) => {
            const game: Game = {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: true,
            };

            tick();

            communicationServiceMock.getGames = jasmine.createSpy().and.returnValue(of([game]));
            const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
            component.createGame(game);
            expect(navigateSpy).toHaveBeenCalledWith([`/game/${game.id}/play`]);
        }),
    ));

    it('should test game', fakeAsync(
        inject([Router], (mockRouter: Router) => {
            const game: Game = {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: true,
            };

            tick();

            communicationServiceMock.getGames = jasmine.createSpy().and.returnValue(of([game]));
            const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
            component.testGame(game);
            expect(navigateSpy).toHaveBeenCalledWith([`/game/${game.id}/test`]);
        }),
    ));

    it('should select game', fakeAsync(
        inject([Router], (mockRouter: Router) => {
            const game = {
                id: '42',
                title: 'Sens de la vie',
                description: 'Questionnaire sur le sens de la vie',
                duration: 10,
                questions: [],
                lastModification: '2001-09-12',
                visible: true,
            };
            const place = 'play';

            communicationServiceMock.getGames = jasmine.createSpy().and.returnValue(of([game]));
            const navigateSpy = spyOn(mockRouter, 'navigate').and.stub();
            component.selectGame(game, place);

            expect(gameCreationServiceMock.selectedGame).toEqual(game);
            expect(navigateSpy).toHaveBeenCalledWith([`/game/${game.id}/play`]);
        }),
    ));
});
