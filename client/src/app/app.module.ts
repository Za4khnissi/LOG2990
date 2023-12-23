import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionDialogComponent } from '@app/components/question-dialog/question-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PlayGameComponent } from '@app/pages/play-game/play-game.component';
import { NgChartsModule } from 'ng2-charts';
import { AnswersGradingDialogComponent } from './components/answers-grading-dialog/answers-grading-dialog.component';
import { ChatComponent } from './components/chat/chat.component';
import { GameHistoryComponent } from './components/game-history/game-history.component';
import { GameOverDialogComponent } from './components/game-over-dialog/game-over-dialog.component';
import { HistogramComponent } from './components/histogram/histogram.component';
import { ImportGameDialogComponent } from './components/import-game-dialog/import-game-dialog.component';
import { ModalAccesComponent } from './components/modal-access/modal-access.component';
import { ModalAdminComponent } from './components/modal-admin/modal-admin.component';
import { PlayersListComponent } from './components/players-list/players-list.component';
import { QuestionDisplayComponent } from './components/question-display/question-display.component';
import { QuestionResultDialogComponent } from './components/question-result-dialog/question-result-dialog.component';
import { TransitionDialogComponent } from './components/transition-dialog/transition-dialog.component';
import { FrenchPaginatorIntl } from './french-paginator-intl';
import { GameListComponent } from './pages/game-list/game-list.component';
import { MatchResultsComponent } from './pages/match-results/match-results.component';
import { OrganizerPageComponent } from './pages/organizer-page/organizer-page.component';
import { TestGameComponent } from './pages/test-game/test-game.component';
import { WaitingRoomComponent } from './pages/waiting-room/waiting-room.component';
/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
// tslint:disable-next-line: no-any
@NgModule({
    declarations: [
        AppComponent,
        CreateGameComponent,
        QuestionDialogComponent,
        AppComponent,
        MainPageComponent,
        AdminPageComponent,
        ModalAdminComponent,
        ChatComponent,
        PlayGameComponent,
        QuestionResultDialogComponent,
        QuestionDisplayComponent,
        TestGameComponent,
        ImportGameDialogComponent,
        GameListComponent,
        GameOverDialogComponent,
        ModalAccesComponent,
        TransitionDialogComponent,
        MatchResultsComponent,
        ModalAccesComponent,
        WaitingRoomComponent,
        OrganizerPageComponent,
        PlayersListComponent,
        GameHistoryComponent,
        AnswersGradingDialogComponent,
        HistogramComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        DragDropModule,
        MatInputModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatCheckboxModule,
        MatTableModule,
        HttpClientModule,
        MatCardModule,
        MatListModule,
        MatProgressBarModule,
        MatGridListModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        NgChartsModule,
        MatSortModule,
        MatRadioModule,
        MatSelectModule,
    ],
    providers: [{ provide: MatPaginatorIntl, useClass: FrenchPaginatorIntl }],
    bootstrap: [AppComponent],
})
export class AppModule {}
