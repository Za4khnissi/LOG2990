import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { QrlAnswer } from '@common/definitions';
import { AnswersGradingDialogComponent } from './answers-grading-dialog.component';

describe('AnswersGradingDialogComponent', () => {
    let component: AnswersGradingDialogComponent;
    let fixture: ComponentFixture<AnswersGradingDialogComponent>;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    const mockQuestion: { [clientId: string]: QrlAnswer } = {
        name: {
            username: 'name',
            answer: 'done',

            grade: 10,
        },
        yo: {
            username: 'yo',
            answer: 'no done',
            grade: 20,
        },
    };

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [AnswersGradingDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockQuestion },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AnswersGradingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should hasNextAnswer', () => {
        component.currentAnswerIndex = 0;
        expect(component.hasNextAnswer()).toBeTruthy();
    });

    it('should hasPreviousAnswer', () => {
        component.currentAnswerIndex = 1;
        expect(component.hasPreviousAnswer()).toBeTruthy();
        // expect( Object.keys(component.qRLAnswers)).toEqual( [
        //   ])
    });

    it('should not hasNextAnswer', () => {
        component.currentAnswerIndex = 1;
        expect(component.hasNextAnswer()).toBeFalsy();
        // expect( Object.keys(component.qRLAnswers)).toEqual( [
        //   ])
    });

    it('should not hasPreviousAnswer', () => {
        component.currentAnswerIndex = 0;
        expect(component.hasPreviousAnswer()).toBeFalsy();
        // expect( Object.keys(component.qRLAnswers)).toEqual( [
        //   ])
    });

    it('should nextAnswer', () => {
        component.currentAnswerIndex = 0;
        component.nextAnswer();
        expect(component.currentAnswerIndex).toEqual(1);
        expect(component.currentAnswer).toEqual({
            username: 'yo',
            answer: 'no done',
            grade: 20,
        });
        // expect( Object.keys(component.qRLAnswers)).toEqual( [
        //   ])
    });

    it('should previousAnswer', () => {
        component.currentAnswerIndex = 1;
        component.previousAnswer();
        expect(component.currentAnswerIndex).toEqual(0);
        expect(component.currentAnswer).toEqual({
            username: 'name',
            answer: 'done',
            grade: 10,
        });
        // expect( Object.keys(component.qRLAnswers)).toEqual( [
        //   ])
    });

    it('should submitGrades', () => {
        component.submitGrades();
        expect(mockDialogRef.close).toHaveBeenCalledWith(component.qRLAnswers);
    });
});
