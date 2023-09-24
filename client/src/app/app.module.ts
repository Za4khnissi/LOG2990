import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuestionDialogComponent } from '@app/components/question-dialog/question-dialog.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ModalAdminComponent } from './components/modal-admin/modal-admin.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        CreateGameComponent,
        QuestionDialogComponent,
        AppComponent,
        MainPageComponent,
        AdminPageComponent,
        ModalAdminComponent,
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
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
