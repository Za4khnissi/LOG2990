/* eslint-disable no-unused-expressions */
import { SelectionModel } from '@angular/cdk/collections';
import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

export interface Games {
    name: string;
    editDate: string; //À changer en date pour après
    visible: boolean;
}

const GAME_DATA_TEST: Games[] = [
    { name: 'SVT', editDate: '2023/05/15', visible: true },
    { name: 'Culture Geek', editDate: '1995/05/15', visible: true },
    { name: 'Hewew', editDate: '1945/09/02', visible: true },
];

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent {
    displayedColumns: string[] = ['gameName', 'gameDate', 'gameVisible']; //, 'gameOptions'
    dataSource = new MatTableDataSource<Games>(GAME_DATA_TEST);
    selection = new SelectionModel<Games>(true, []);

    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    // masterToggle() {
    //     // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    //     this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
    // }

    logSelection() {
        // eslint-disable-next-line no-console
        this.selection.selected.forEach((s) => console.log(s.name));
    }
}
