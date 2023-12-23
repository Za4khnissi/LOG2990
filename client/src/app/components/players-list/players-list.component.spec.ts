import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SimpleChange } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommunicationService } from '@app/services/communication.service';
import { MatchPlayer } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
import { PlayersListComponent } from './players-list.component';

describe('PlayersListComponent', () => {
    let component: PlayersListComponent;
    let fixture: ComponentFixture<PlayersListComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, FormsModule, MatPaginatorModule, BrowserAnimationsModule, MatRadioModule],
            declarations: [PlayersListComponent],
            providers: [{ provide: CommunicationService }],
        });
        fixture = TestBed.createComponent(PlayersListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should send true when trying to insert a name from the banlist on isPlayerBanned', () => {
        component.matchHandler.withdrawnPlayers = ['jean'];
        expect(component.isPlayerWithdrawn('jean')).toBeTruthy();
    });

    it('should return false when trying to insert a name that is not in the banlist on isPlayerBanned', () => {
        component.matchHandler.withdrawnPlayers = ['jean'];
        expect(component.isPlayerWithdrawn('paul')).toBeFalsy();
    });

    it('should onToggleChatLock ', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        const spy = spyOn(component['socketService'], 'send');
        const eventName = MatchEvents.toggleChatLock;
        component.matchHandler.accessCode = '5826';
        const testString = { accessCode: component.matchHandler.accessCode, username: 'fd' };

        component.onToggleChatLock(component.players[0]);
        expect(spy).toHaveBeenCalledWith(eventName, testString);
        expect(component.players[0].lockedRoom).toBeTruthy();
    });

    it('should displaySelection ', () => {
        const spy = spyOn(component['socketService'], 'send');
        const eventName = MatchEvents.classificationChange;
        component.matchHandler.accessCode = '5826';
        component.gameplay.classificationChoice = 'name';
        component.gameplay.orderChoice = false;
        const testString = { accessCode: component.matchHandler.accessCode, classification: 'name', choice: false };

        component.displaySelection();
        expect(spy).toHaveBeenCalledWith(eventName, testString);
    });

    it('should trackByPlayerId ', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        expect(component.trackByPlayerId(component.players[0])).toEqual('3');
    });
    it('should return green ', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.FINISHED,
                lockedRoom: false,
            },
        ];

        expect(component.setUpColor(component.players[0])).toEqual('green');
    });

    it('should return yellow ', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.SELECT,
                lockedRoom: false,
            },
        ];

        expect(component.setUpColor(component.players[0])).toEqual('yellow');
    });

    it('should return red ', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];

        expect(component.setUpColor(component.players[0])).toEqual('red');
    });

    it('should return black ', () => {
        const player = {
            clientId: '3',
            username: 'fd',
            score: 0,
            bonusCount: 0,
            status: MatchPlayer.QUIT,
            lockedRoom: false,
        };

        component.matchHandler.withdrawnPlayers = ['fd'];

        expect(component.setUpColor(player)).toEqual('black');
    });

    it('should call updatePaginatedPlayers every time the component changes', fakeAsync(() => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'yoyo',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        const spy = spyOn(component, 'updatePaginatedPlayers');
        const spyafficher = spyOn(component, 'displaySelection');
        component.ngOnChanges({
            players: new SimpleChange(null, component.players, true),
        });
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
        expect(spyafficher).toHaveBeenCalled();
    }));

    it('should change player page in paginatedPlayers function', () => {
        component.players = [
            {
                clientId: '3',
                username: 'fd',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
            {
                clientId: '4',
                username: 'yoyo',
                score: 0,
                bonusCount: 0,
                status: MatchPlayer.NO_TOUCH,
                lockedRoom: false,
            },
        ];
        const event: PageEvent = new PageEvent();
        event.pageIndex = 1;
        event.pageSize = 1;

        component.pageChanged(event);

        expect(component.paginatedPlayers.length).toEqual(1);
    });

    it('should select', () => {
        const spyselection = spyOn(component, 'displaySelection');
        component.gameplay.classificationChoice = 'name';
        component.gameplay.orderChoice = false;
        component.select('score', true);

        expect(component.gameplay.classificationChoice).toEqual('score');
        expect(component.gameplay.orderChoice).toEqual(true);
        expect(spyselection).toHaveBeenCalled();
    });
});
