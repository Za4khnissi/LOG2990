import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { DEFAULT_CHART_OPTIONS } from '@common/constants';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
@Component({
    selector: 'app-histogram',
    templateUrl: './histogram.component.html',
    styleUrls: ['./histogram.component.scss'],
})
export class HistogramComponent implements OnChanges, AfterViewInit {
    @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    @Input() barChartData: ChartData<'bar'>;
    @Input() legendLabels: { text: string; fillStyle: string }[] = [];
    @Input() xAxisLabel: string = '';

    histogramOptions: ChartConfiguration['options'] = DEFAULT_CHART_OPTIONS;

    ngAfterViewInit(): void {
        this.updateHistogram();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.barChartData || changes.legendLabels || changes.xAxisLabel) {
            if (this.chart) {
                this.updateHistogram(changes);
            }
        }
    }

    private updateHistogram(changes: SimpleChanges | null = null): void {
        if (this.histogramOptions?.plugins?.legend) {
            if (this.legendLabels.length === 0) {
                this.histogramOptions.plugins.legend.display = false;
            } else {
                this.histogramOptions.plugins.legend.display = true;
                this.histogramOptions.plugins.legend.labels = {
                    generateLabels: () => this.legendLabels,
                };
            }
        }

        if (this.histogramOptions?.scales?.x) {
            this.histogramOptions.scales.x = {
                title: {
                    display: true,
                    text: this.xAxisLabel,
                },
            };
        }

        if ((changes?.barChartData || changes == null) && this.chart.chart) {
            this.chart.chart.data = this.barChartData;
        }

        this.chart?.update('none');

        if (!changes) this.chart.ngOnChanges({} as SimpleChanges);
    }
}
