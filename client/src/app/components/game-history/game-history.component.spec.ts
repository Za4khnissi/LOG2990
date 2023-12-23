// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { GameHistoryComponent } from './game-history.component';
// import { EMPTY, Observable, of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatchConcluded } from '@common/definitions';
import { of } from 'rxjs';
import SpyObj = jasmine.SpyObj;
// import { HttpResponse } from '@angular/common/http';
// class CommunicationServiceMock {
//   getHistory(): Observable<MatchConcluded[]> {
//     // Retourne un observable simulé pour getHistory
//     return of([
//       { gameName: 'Mock Game', beginDate: new Date(), initialPlayerCount: 1, bestScore: 99 }
//     ]);
//   }

//   resetHistory(): Observable<void> {
//     // Retourne un observable vide pour resetHistory
//     return EMPTY;
//   }
// }

const NUMBER_ASC = -1;
const NUMBER_DESC = 1;
describe('GameHistoryComponent', () => {
    let component: GameHistoryComponent;
    let fixture: ComponentFixture<GameHistoryComponent>;
    let communicationServiceSpy: SpyObj<CommunicationService>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockPaginator = {} as any;

    beforeEach(async () => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['getHistory', 'resetHistory']);

        TestBed.configureTestingModule({
            declarations: [GameHistoryComponent],
            imports: [
                MatPaginatorModule,
                MatSortModule,
                MatTableModule,
                MatIconModule,
                BrowserAnimationsModule,
                HttpClientModule,
                FormsModule,
                BrowserModule,
            ],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        }).compileComponents();

        fixture = TestBed.createComponent(GameHistoryComponent);
        component = fixture.componentInstance;
        //  fixture.detectChanges();
        // communicationServiceSpy = TestBed.inject(CommunicationService) as jasmine.SpyObj<CommunicationService>;

        component.paginator = mockPaginator;
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call getHistory and set up the dataSource on ngOnInit', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();

        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [{ gameName: 'Test Game', beginDate: new Date(), initialPlayerCount: 2, bestScore: 42 }];

        communicationServiceSpy.getHistory.and.returnValue(of(mockData));

        component.ngOnInit();

        expect(communicationServiceSpy.getHistory).toHaveBeenCalled();
        expect(component.dataSource.data).toEqual(mockData);
    });

    it('should set up dataSource and sortingDataAccessor', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();

        component.paginator = mockPaginator;
        component.sort = mockSort;

        component.setupDataSource();

        expect(component.dataSource.paginator).toBe(mockPaginator);
        expect(component.dataSource.sort).toBe(mockSort);
    });

    it('should sort by gameName asc', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();
        const date = new Date();

        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [
            { gameName: 'Test Game 2', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 1', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 3', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
        ];
        component.dataSource.data = mockData;
        component.setupDataSource();
        component.sort.sortChange.subscribe(() => {
            component.dataSource.data.sort((a, b) => {
                const gameNameA = a.gameName.toUpperCase();
                const gameNameB = b.gameName.toUpperCase();

                if (gameNameA < gameNameB) {
                    return component.sort.direction === 'asc' ? NUMBER_ASC : NUMBER_DESC;
                }
                if (gameNameA > gameNameB) {
                    return component.sort.direction === 'asc' ? NUMBER_DESC : NUMBER_ASC;
                }
                return 0;
            });
        });

        component.sort.sort({ id: 'gameName', start: 'asc', disableClear: false });

        expect(component.dataSource.data).toEqual([
            { gameName: 'Test Game 1', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 2', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 3', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
        ]);
    });
    it('should sort by gameName desc', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();
        const date = new Date();

        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [
            { gameName: 'Test Game 1', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 2', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 3', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
        ];
        component.dataSource.data = mockData;
        component.setupDataSource();

        component.sort.sortChange.subscribe(() => {
            component.dataSource.data.sort((a, b) => {
                const gameNameA = a.gameName.toUpperCase();
                const gameNameB = b.gameName.toUpperCase();
                if (gameNameA < gameNameB) {
                    return component.sort.direction === 'asc' ? NUMBER_ASC : NUMBER_DESC;
                }
                if (gameNameA > gameNameB) {
                    return component.sort.direction === 'asc' ? NUMBER_DESC : NUMBER_ASC;
                }
                return 0;
            });
        });
        component.sort.sort({ id: 'gameName', start: 'desc', disableClear: false });

        expect(component.dataSource.data).toEqual([
            { gameName: 'Test Game 3', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 2', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 1', beginDate: date, initialPlayerCount: 2, bestScore: 42 },
        ]);
    });
    it('should sort by beginDate asc', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();
        const DATE_ONE = new Date('2021-01-01T12:00:00');
        const DATE_TWO = new Date('2021-01-02T12:00:00');
        const DATE_THREE = new Date('2021-01-03T12:00:00');
        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [
            { gameName: 'Test Game', beginDate: DATE_TWO, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_ONE, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_THREE, initialPlayerCount: 2, bestScore: 42 },
        ];
        component.dataSource.data = mockData;
        component.setupDataSource();
        component.sort.sortChange.subscribe(() => {
            component.dataSource.data.sort((a, b) => {
                const dateA = new Date(a.beginDate);
                const dateB = new Date(b.beginDate);

                return component.sort.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            });
        });
        component.sort.sort({ id: 'beginDate', start: 'asc', disableClear: false });

        expect(component.dataSource.data).toEqual([
            { gameName: 'Test Game', beginDate: DATE_ONE, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_TWO, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_THREE, initialPlayerCount: 2, bestScore: 42 },
        ]);
    });
    it('should sort by beginDate desc', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();
        const DATE_ONE = new Date('2021-01-01T12:00:00');
        const DATE_TWO = new Date('2021-01-02T12:00:00');
        const DATE_THREE = new Date('2021-01-03T12:00:00');

        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [
            { gameName: 'Test Game', beginDate: DATE_ONE, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_TWO, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_THREE, initialPlayerCount: 2, bestScore: 42 },
        ];
        component.dataSource.data = mockData;
        component.setupDataSource();
        component.sort.sortChange.subscribe(() => {
            component.dataSource.data.sort((a, b) => {
                const dateA = new Date(a.beginDate);
                const dateB = new Date(b.beginDate);

                return component.sort.direction === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            });
        });
        component.sort.sort({ id: 'beginDate', start: 'desc', disableClear: false });

        expect(component.dataSource.data).toEqual([
            { gameName: 'Test Game', beginDate: DATE_THREE, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_TWO, initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game', beginDate: DATE_ONE, initialPlayerCount: 2, bestScore: 42 },
        ]);
    });

    it('should sort by default', () => {
        const changeDetectorRefSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges', 'markForCheck']);
        mockPaginator = new MatPaginator(new MatPaginatorIntl(), changeDetectorRefSpy);
        const mockSort = new MatSort();
        component.dataSource = new MatTableDataSource<MatchConcluded>();

        component.paginator = mockPaginator;
        component.sort = mockSort;
        const mockData = [
            { gameName: 'Test Game 1', beginDate: new Date('2021-01-01T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 2', beginDate: new Date('2021-01-02T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 3', beginDate: new Date('2021-01-03T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
        ];
        component.dataSource.data = mockData;
        component.setupDataSource();

        component.sort.sort({ id: 'bestScore', start: 'asc', disableClear: false });

        expect(component.dataSource.data).toEqual([
            { gameName: 'Test Game 1', beginDate: new Date('2021-01-01T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 2', beginDate: new Date('2021-01-02T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
            { gameName: 'Test Game 3', beginDate: new Date('2021-01-03T12:00:00'), initialPlayerCount: 2, bestScore: 42 },
        ]);
    });

    it('should format the date correctly', () => {
        const matchDate = new Date('2022-01-01T12:00:00');
        const formattedDate = component.formatDate(matchDate);
        expect(formattedDate).toEqual('2022/1/1 12:00:00');
    });

    it('should call resethistory in deleteHistory', fakeAsync(() => {
        const resetHistorySpy = communicationServiceSpy.resetHistory.and.returnValue(of());

        component.deleteHistory();

        expect(resetHistorySpy).toHaveBeenCalled();

        tick();
    }));
});
