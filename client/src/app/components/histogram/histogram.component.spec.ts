/* eslint-disable @typescript-eslint/no-explicit-any */
import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { HistogramComponent } from './histogram.component';

describe('HistogramComponent', () => {
    let component: HistogramComponent;
    let fixture: ComponentFixture<HistogramComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, NgChartsModule],
            declarations: [HistogramComponent],
        });
        fixture = TestBed.createComponent(HistogramComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updatehistogram in ngOnChanges ', fakeAsync(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'updateHistogram');

        component.ngOnChanges({
            barChartData: new SimpleChange(null, component.barChartData, true),
        });
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
    }));

    // it('should updatehistogram ', fakeAsync(() => {
    //   component.histogramOptions?.plugins?.legend.display=false;
    //   const spy = spyOn<any>(component, 'updateHistogram');

    //   component.ngOnChanges({
    //     barChartData: new SimpleChange(null, component.barChartData, true),
    //   });
    //   fixture.detectChanges();
    //   expect(spy).toHaveBeenCalled();

    // }));
});
