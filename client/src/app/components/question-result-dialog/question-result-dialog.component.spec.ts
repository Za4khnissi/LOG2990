import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { QuestionResultDialogComponent } from './question-result-dialog.component';

describe('QuestionResultDialogComponent', () => {
    let component: QuestionResultDialogComponent;
    let fixture: ComponentFixture<QuestionResultDialogComponent>;

    const mockQuestion = {
        correctChoices: [],
        message: [],
        isCorrect: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [FormsModule, MatDialogModule, MatButtonModule, CommonModule],
            declarations: [QuestionResultDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: mockQuestion }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });
        fixture = TestBed.createComponent(QuestionResultDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
