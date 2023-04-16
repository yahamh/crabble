import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GeneralChatBoxComponent } from '@app/components/general-chat-box/general-chat-box.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { ConnectionPageComponent } from '@app/pages/connection-page/connection-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HomepageComponent } from '@app/pages/homepage/homepage.component';
import { NewGamePageComponent } from '@app/pages/new-game-page/new-game-page.component';
import { ProfileEditionPageComponent } from '@app/pages/profile-edition-page/profile-edition-page.component';
import { StatisticsPageComponent } from '@app/pages/statistics-page/statistics-page.component';
import { UserProfilePageComponent } from '@app/pages/user-profile-page/user-profile-page.component';
import { WaitingRoomPageComponent } from '@app/pages/waiting-room-page/waiting-room-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/connection', pathMatch: 'full' },
    { path: 'connection', component: ConnectionPageComponent},
    { path: 'home', component: HomepageComponent },
    { path: 'new-game', component: NewGamePageComponent },
    { path: 'leaderboard', component: HomepageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'user-profile', component: UserProfilePageComponent },
    { path: 'edit-profile', component: ProfileEditionPageComponent },
    { path: 'statistics', component: StatisticsPageComponent },
    { path: 'chat', component: GeneralChatBoxComponent },
    { path: 'waiting-room', component: WaitingRoomPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
