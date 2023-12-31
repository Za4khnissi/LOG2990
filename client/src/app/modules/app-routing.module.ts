import { NgModule, inject } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
// import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
// import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { TestGameComponent } from '@app/pages//test-game/test-game.component';
import { CreateGameComponent } from '@app/pages/create-game/create-game.component';
import { GameListComponent } from '@app/pages/game-list/game-list.component';
import { MatchResultsComponent } from '@app/pages/match-results/match-results.component';
import { OrganizerPageComponent } from '@app/pages/organizer-page/organizer-page.component';
import { PlayGameComponent } from '@app/pages/play-game/play-game.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { AdminGuard } from '@app/services/admin.guard.service';
import { PlayGameGuardService } from '@app/services/play-game.guard.service';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game-list', component: GameListComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'admin', component: AdminPageComponent, canActivate: [() => inject(AdminGuard).canActivateFunc()] },
    { path: 'game/:id/play', component: PlayGameComponent, canActivate: [PlayGameGuardService] },
    { path: 'game/:id/test', component: TestGameComponent },
    { path: 'game/create', component: CreateGameComponent, canActivate: [() => inject(AdminGuard).canActivateFunc()] },
    { path: 'game/:id/modify', component: CreateGameComponent, canActivate: [() => inject(AdminGuard).canActivateFunc()] },
    { path: 'games', component: GameListComponent },
    { path: 'game/results', component: MatchResultsComponent },
    { path: 'game/organizer', component: OrganizerPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
