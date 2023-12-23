import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CommunicationService } from '@app/services/communication.service';
import { MatchConcluded } from '@common/definitions';
import { REAL_MONTH_LAG, PAGE_SIZE_OPTIONS } from '@common/constants';

@Component({
    selector: 'app-game-history',
    templateUrl: './game-history.component.html',
    styleUrls: ['./game-history.component.scss'],
})
export class GameHistoryComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    displayedColumns: string[] = ['gameName', 'beginDate', 'initialPlayerCount', 'bestScore'];
    dataSource: MatTableDataSource<MatchConcluded>;
    pageSizeOption: number[] = PAGE_SIZE_OPTIONS;

    gameHistory: MatchConcluded[] = [];

    constructor(private communicationService: CommunicationService) {}

    ngOnInit(): void {
        this.communicationService.getHistory().subscribe((concludedMatches: MatchConcluded[]) => {
            this.dataSource = new MatTableDataSource<MatchConcluded>(concludedMatches);
            this.setupDataSource();
        });
    }

    setupDataSource(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataSource.sortingDataAccessor = (item, property: string) => {
            switch (property) {
                case 'gameName':
                    return item.gameName;
                case 'beginDate':
                    return item.beginDate;
                default:
                    return Object.values(item).find((value) => value[property]);
            }
        };
    }

    formatDate(matchDate: Date): string {
        const dateObj = new Date(matchDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + REAL_MONTH_LAG;
        const day = dateObj.getDate();
        const date = `${year}/${month}/${day}`;
        const time = dateObj.toLocaleTimeString('en-GB');
        return `${date} ${time}`;
    }

    deleteHistory(): void {
        this.communicationService.resetHistory().subscribe(() => {
            this.gameHistory = [];
            this.dataSource = new MatTableDataSource<MatchConcluded>(this.gameHistory);
            this.dataSource.paginator = this.paginator;
        });
    }
}
