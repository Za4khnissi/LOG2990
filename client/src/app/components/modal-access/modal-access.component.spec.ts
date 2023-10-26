import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuestionResultDialogComponent } from './question-result-dialog.component';

describe('QuestionResultDialogComponent', () => {
    let component: QuestionResultDialogComponent;
    let fixture: ComponentFixture<QuestionResultDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuestionResultDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        });
        fixture = TestBed.createComponent(QuestionResultDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
