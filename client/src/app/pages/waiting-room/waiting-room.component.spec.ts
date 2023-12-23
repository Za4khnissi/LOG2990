import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { MatchPlayer, Player } from '@common/definitions';
import { of } from 'rxjs';
import { WaitingRoomComponent } from './waiting-room.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    let mockSocketService: jasmine.SpyObj<SocketClientService>;
    let mockDialog: jasmine.SpyObj<MatDialog>;
    let mockRouter: jasmine.SpyObj<Router>;
    let mockMatchHandlerService: jasmine.SpyObj<MatchHandlerService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockDialogRef: jasmine.SpyObj<MatDialogRef<any>>;

    beforeEach(async () => {
        mockSocketService = jasmine.createSpyObj('SocketClientService', [
            'connect',
            'disconnect',
            'on',
            'createWaitingRoom',
            'joinWaitingRoom',
            'lockRoom',
            'unlockRoom',
            'removeUser',
            'startGame',
        ]);

        mockDialog = jasmine.createSpyObj('MatDialog', ['open', 'closeAll']);
        mockRouter = jasmine.createSpyObj('Router', ['navigate']);
        mockMatchHandlerService = jasmine.createSpyObj('MatchHandlerService', [
            'configureBaseSocketFeatures', // Dummy method
        ]);

        Object.defineProperty(mockMatchHandlerService, 'isOrganizer', {
            get: () => true,
            configurable: true,
        });

        Object.defineProperty(mockMatchHandlerService, 'selectedGameId', {
            value: '1',
        });

        mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);

        mockDialog.open.and.returnValue(mockDialogRef);
        mockDialogRef.afterClosed.and.returnValue(of(null));

        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                { provide: SocketClientService, useValue: mockSocketService },
                { provide: MatDialog, useValue: mockDialog },
                { provide: Router, useValue: mockRouter },
                { provide: MatchHandlerService, useValue: mockMatchHandlerService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // Test ngOnInit
    describe('ngOnInit', () => {
        it('should handle organizer left event', () => {
            const spyalert = spyOn(window, 'alert');
            const organizerLeftCallback = mockSocketService.on.calls.argsFor(0)[1];
            organizerLeftCallback(null);
            expect(spyalert).toHaveBeenCalledWith("L'organisateur a quitté la salle. Vous serez redirigé vers la page d'accueil.");
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });

        it('should handle kickedOut event', () => {
            const spyalert = spyOn(window, 'alert');
            const kickedOutCallback = mockSocketService.on.calls.argsFor(1)[1];
            kickedOutCallback(null);
            expect(spyalert).toHaveBeenCalledWith('Vous avez été expulsé de la partie!');
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });

        it('should handle Error event', () => {
            const spyalert = spyOn(window, 'alert');
            const errorCallback = mockSocketService.on.calls.argsFor(2)[1];
            errorCallback(null);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
            expect(spyalert).toHaveBeenCalledWith(null);
        });

        it('should handle GameStarted event for organizer', () => {
            const gameStartedCallback = mockSocketService.on.calls.argsFor(3)[1];
            gameStartedCallback(null);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/game/organizer']);
        });

        it('should handle GameStarted event for player', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(false);
            const gameStartedCallback = mockSocketService.on.calls.argsFor(3)[1];
            gameStartedCallback(null);
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/game/1/play']);
        });
    });

    // Test ngOnDestroy
    describe('ngOnDestroy', () => {
        it('should disconnect from socket and navigate to home', () => {
            component.ngOnDestroy();
            expect(mockSocketService.disconnect).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });
    });

    // Test isPlayerOrganizer
    describe('isPlayerOrganizer', () => {
        it('should return true if player is organizer', () => {
            const player: Player = { username: 'Organisateur' } as Player;
            expect(component.isPlayerOrganizer(player)).toBeTrue();
        });

        it('should return false if player is not organizer', () => {
            const player: Player = { username: 'Player1' } as Player;
            expect(component.isPlayerOrganizer(player)).toBeFalse();
        });
    });

    // Test lockRoom
    describe('lockRoom', () => {
        it('should lock the room and call service method', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(true);
            mockMatchHandlerService.accessCode = '123';
            component.lockRoom();
            expect(component.roomLocked).toBeTrue();
            expect(mockSocketService.lockRoom).toHaveBeenCalledWith('123');
        });

        it('should not lock the room if player is not organizer', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(false);
            component.lockRoom();
            expect(component.roomLocked).toBeFalse();
            expect(mockSocketService.lockRoom).not.toHaveBeenCalled();
        });
    });

    // Test unlockRoom
    describe('unlockRoom', () => {
        it('should unlock the room and call service method', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(true);
            mockMatchHandlerService.accessCode = '123';
            component.unlockRoom();
            expect(component.roomLocked).toBeFalse();
            expect(mockSocketService.unlockRoom).toHaveBeenCalledWith('123');
        });

        it('should not unlock the room if player is not organizer', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(false);
            component.unlockRoom();
            expect(component.roomLocked).toBeFalse();
            expect(mockSocketService.unlockRoom).not.toHaveBeenCalled();
        });
    });
    // Test excludePlayer
    describe('excludePlayer', () => {
        it('should call removeUser on service with selected player username and access code', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(true);
            const player: Player = { clientId: 'yo', username: 'Player1', score: 10, bonusCount: 1, status: MatchPlayer.NO_TOUCH, lockedRoom: false };
            component.matchHandler.players = [player];
            // component.selectedPlayer = { username: 'Player1' } as Player;
            mockMatchHandlerService.accessCode = '123';
            component.excludePlayer(player);
            expect(mockSocketService.removeUser).toHaveBeenCalledWith('Player1', '123');
            expect(component.matchHandler.players.length).toEqual(0);
        });

        it('should not call removeUser on service if player is not organizer', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(false);
            const player: Player = { clientId: 'yo', username: 'Player1', score: 10, bonusCount: 1, status: MatchPlayer.NO_TOUCH, lockedRoom: false };
            component.matchHandler.players = [player];
            // component.selectedPlayer = { username: 'Player1' } as Player;
            mockMatchHandlerService.accessCode = '123';
            component.excludePlayer(player);
            expect(mockSocketService.removeUser).not.toHaveBeenCalled();
            expect(component.matchHandler.players.length).toEqual(1);
        });

        it('should set selectedPlayer to the player passed in the argument', () => {
            const player = { username: 'Player2' } as Player;
            component.onPlayerSelect(player);
            expect(component.selectedPlayer).toBe(player);
        });

        it('should return the unique identifier of the player', () => {
            const index = 0; // The index is not used in this implementation, so any value works
            const player = { username: 'Player1' } as Player;
            expect(component.trackByFn(index, player)).toBe(player.username);
        });
    });

    // Test startGame
    describe('startGame', () => {
        it('should not start game if room is not locked', () => {
            const spyalert = spyOn(window, 'alert');
            component.roomLocked = false;
            component.startGame();
            expect(mockSocketService.startGame).not.toHaveBeenCalled();
            expect(spyalert).toHaveBeenCalledWith('La salle doit être verrouillée avant de commencer le jeu.');
            // You might also want to check if the alert was called
        });

        it('should start game if room is locked', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(true);
            mockMatchHandlerService.accessCode = '123';
            component.roomLocked = true;
            component.startGame();
            expect(mockSocketService.startGame).toHaveBeenCalledWith('123');
        });

        it('should not start game if player is not organizer', () => {
            spyOnProperty(mockMatchHandlerService, 'isOrganizer', 'get').and.returnValue(false);
            component.roomLocked = true;
            component.startGame();
            expect(mockSocketService.startGame).not.toHaveBeenCalled();
        });
    });

    describe('leaveRoom', () => {
        it('should disconnect from socket and navigate to home if game has not started', () => {
            component.isGameStarted = false;
            component.leaveRoom();
            expect(mockSocketService.disconnect).toHaveBeenCalled();
            expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
        });

        it('should not disconnect from socket nor navigate if game has started', () => {
            component.isGameStarted = true;
            component.leaveRoom();
            expect(mockSocketService.disconnect).not.toHaveBeenCalled();
            expect(mockRouter.navigate).not.toHaveBeenCalled();
        });
    });

    afterEach(() => {
        fixture.destroy();
    });
});
