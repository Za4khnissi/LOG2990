import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { GameOverDialogComponent } from './game-over-dialog.component';

describe('GameOverDialogComponent', () => {
    let component: GameOverDialogComponent;
    let fixture: ComponentFixture<GameOverDialogComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatDialogModule, FormsModule],
            declarations: [GameOverDialogComponent],
            providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
        });
        fixture = TestBed.createComponent(GameOverDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
