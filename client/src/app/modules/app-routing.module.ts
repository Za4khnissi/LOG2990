import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
// import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
// import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { AdminGuard } from '@app/services/admin.guard';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    // { path: 'game', component: GamePageComponent },
    // { path: 'material', component: MaterialPageComponent },
    { path: 'admin', component: AdminPageComponent, canActivate: [() => inject(AdminGuard).canActivateFunc()] },
    { path: 'game/create', component: CreateGameComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
