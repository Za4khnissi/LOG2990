import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransitionDialogComponent } from './transition-dialog.component';

// class MatDialogRefMock {

//   duration=TIMEOUT;
// }

describe('TransitionDialogComponent', () => {
    let component: TransitionDialogComponent;
    let fixture: ComponentFixture<TransitionDialogComponent>;
    const TIMEOUT = 5;
    const MS_SECOND = 1000;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };
    // let dialogRefMock: any;

    beforeEach(() => {
        // dialogRefMock = new MatDialogRefMock();
        TestBed.configureTestingModule({
            imports: [FormsModule, MatDialogModule, MatProgressBarModule, MatProgressSpinnerModule, MatCardModule],
            declarations: [TransitionDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(TransitionDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
    it('startTimer should start an interval', fakeAsync(() => {
        component.data.duration = TIMEOUT;
        component.ngOnInit();
        const interval = component.timer;
        expect(interval).toBeTruthy();
        expect(component.remainingTime).toEqual(TIMEOUT);
        discardPeriodicTasks();
    }));

    it('startTimer should call setInterval', fakeAsync(() => {
        const spy = spyOn(window, 'setInterval');
        component.data.duration = TIMEOUT;
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    it('interval should reduce time by 1 every second ', fakeAsync(() => {
        component.data.duration = TIMEOUT;
        component.ngOnInit();
        tick(MS_SECOND);
        expect(component.remainingTime).toEqual(TIMEOUT - 1);
        tick(MS_SECOND);
        expect(component.remainingTime).toEqual(TIMEOUT - 2);
        discardPeriodicTasks();
    }));

    it('interval should stop after TIMEOUT seconds ', fakeAsync(() => {
        component.data.duration = TIMEOUT;
        component.ngOnInit();
        tick((TIMEOUT + 2) * MS_SECOND);
        expect(component.remainingTime).toEqual(0);
        discardPeriodicTasks();
    }));

    it('ngoninit should call clearInterval ', fakeAsync(() => {
        const spy = spyOn(window, 'clearInterval');
        component.data.duration = TIMEOUT;
        component.ngOnInit();
        tick((TIMEOUT + 1) * MS_SECOND); // un tick de plus que la limite
        expect(spy).toHaveBeenCalled();
        discardPeriodicTasks();
    }));

    //  it('startTimer should not start a new interval if one exists', fakeAsync(() => {
    //   component.data.duration=TIMEOUT
    //   component.ngOnInit();
    //    const spy = spyOn(window, 'setInterval');
    //     component.data.duration=TIMEOUT
    //   component.ngOnInit();
    //    expect(spy).not.toHaveBeenCalled();
    //    discardPeriodicTasks();
    //  }));
});
