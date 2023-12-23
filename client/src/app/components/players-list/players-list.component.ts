import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { GameplayLogicService } from '@app/services/gameplay-logic.service';
import { MatchHandlerService } from '@app/services/match-handler.service';
import { SocketClientService } from '@app/services/socket.client.service';
import { PAGE_INDEX, PAGE_SIZE, PAGE_SIZE_OPTIONS, STATUS_COLOR } from '@common/constants';
import { MatchPlayer, Player } from '@common/definitions';
import { MatchEvents } from '@common/socket.events';
@Component({
    selector: 'app-players-list',
    templateUrl: './players-list.component.html',
    styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements OnInit, OnChanges {
    @ViewChild('chat') chat: ElementRef | undefined;
    @Input() players: Player[] = [];
    pageSize = PAGE_SIZE;
    pageIndex = PAGE_INDEX;
    paginatedPlayers: Player[] = [];
    pageSizeOptions = PAGE_SIZE_OPTIONS;

    constructor(
        readonly matchHandler: MatchHandlerService,
        private socketService: SocketClientService,
        public gameplay: GameplayLogicService,
    ) {}

    isPlayerWithdrawn(username: string): boolean {
        return this.matchHandler.withdrawnPlayers.includes(username);
    }

    setUpColor(player: Player): string {
        if (this.isPlayerWithdrawn(player.username)) return STATUS_COLOR.withdrawn;
        if (this.hasPlayerSubmitted(player)) return STATUS_COLOR.submitted;
        if (this.isPlayerSelected(player)) return STATUS_COLOR.selected;
        return STATUS_COLOR.initial;
    }

    displaySelection(): void {
        this.socketService.send(MatchEvents.classificationChange, {
            accessCode: this.matchHandler.accessCode,
            classification: this.gameplay.classificationChoice,
            choice: this.gameplay.orderChoice,
        });
    }

    select(value: string, choice: boolean): void {
        this.gameplay.classificationChoice = value;
        this.gameplay.orderChoice = choice;
        this.displaySelection();
    }

    onToggleChatLock(player: Player): void {
        if (player.status !== MatchPlayer.QUIT) {
            this.socketService.send(MatchEvents.toggleChatLock, { accessCode: this.matchHandler.accessCode, username: player.username });
            player.lockedRoom = !player.lockedRoom;
        }
    }

    isPlayerSelected(player: Player): boolean {
        return player.status === MatchPlayer.SELECT;
    }

    hasPlayerSubmitted(player: Player): boolean {
        return player.status === MatchPlayer.FINISHED;
    }

    ngOnInit(): void {
        this.updatePaginatedPlayers(this.pageIndex, this.pageSize);
    }

    trackByPlayerId(player: Player): string {
        return player.clientId;
    }
    ngOnChanges(changes: SimpleChanges): void {
        if (changes.players) {
            this.updatePaginatedPlayers(this.pageIndex, this.pageSize);
            this.displaySelection();
        }
    }

    updatePaginatedPlayers(index: number, pageSize: number): void {
        const startIdx = index * pageSize;
        const endIdx = startIdx + this.pageSize;
        this.paginatedPlayers = this.players.slice(startIdx, endIdx);
    }

    pageChanged(event: PageEvent): void {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.updatePaginatedPlayers(this.pageIndex, this.pageSize);
    }
}
