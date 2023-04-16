import { HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderBarComponent } from '@app/components/header-bar/header-bar.component';
import { ConvertToSoloFormComponent } from '@app/components/modals/convert-to-solo-form/convert-to-solo-form.component';
import { DisconnectedFromServerComponent } from '@app/components/modals/disconnected-from-server/disconnected-from-server.component';
import { ErrorDialogComponent } from '@app/components/modals/error-dialog/error-dialog.component';
import { JoinOnlineGameComponent } from '@app/components/modals/join-online-game/join-online-game.component';
import { LeaderboardComponent } from '@app/components/modals/leaderboard/leaderboard.component';
import { NewOnlineGameFormComponent } from '@app/components/modals/new-online-game-form/new-online-game-form.component';
import { NewSoloGameFormComponent } from '@app/components/modals/new-solo-game-form/new-solo-game-form.component';
import { PendingGamesComponent } from '@app/components/modals/pending-games/pending-games.component';
import { WaitingForPlayerComponent } from '@app/components/modals/waiting-for-player/waiting-for-player.component';
import { ClickAndClickoutDirective } from '@app/directives/click-and-clickout.directive';
import { MouseRollDirective } from '@app/directives/mouse-roll.directive';
import { PreventContextMenuDirective } from '@app/directives/prevent-context-menu.directive';
import { CommandExecuterService } from '@app/game-logic/commands/command-executer/command-executer.service';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AdminBotComponent } from '@app/pages/admin-page/admin-bot-virtuel/admin-bot.component';
import { AdminDictComponent } from '@app/pages/admin-page/admin-dict/admin-dict.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AppComponent } from '@app/pages/app/app.component';
import { BoardComponent } from '@app/pages/game-page/board/board.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { HorseComponent } from '@app/pages/game-page/horse/horse.component';
import { InfoBoxComponent } from '@app/pages/game-page/info-box/info-box.component';
import { PlayerInfoComponent } from '@app/pages/game-page/player-info/player-info.component';
import { HomepageComponent } from '@app/pages/homepage/homepage.component';
import { NewGamePageComponent } from '@app/pages/new-game-page/new-game-page.component';
import { BoldPipe } from '@app/pipes/bold-pipe/bold.pipe';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { GeneralChatBoxComponent } from './components/general-chat-box/general-chat-box.component';
import { AbandonDialogComponent } from './components/modals/abandon-dialog/abandon-dialog.component';
import { AccountCreationFormComponent } from './components/modals/account-creation-form/account-creation-form.component';
import { AddDictDialogComponent } from './components/modals/add-dict-dialog/add-dict-dialog.component';
import { AlertDialogComponent } from './components/modals/alert-dialog/alert-dialog.component';
import { EditBotDialogComponent } from './components/modals/edit-bot-dialog/edit-bot-dialog.component';
import { EditDictDialogComponent } from './components/modals/edit-dict/edit-dict.component';
import { FriendsManagerComponent } from './components/modals/friends-manager/friends-manager.component';
import { JoinChatroomFormComponent } from './components/modals/join-chatroom-form/join-chatroom-form.component';
import { LoadingGameComponent } from './components/modals/loading-game/loading-game.component';
import { LoginFormComponent } from './components/modals/login-form/login-form.component';
import { ProfilePictureFormComponent } from './components/modals/profile-picture-form/profile-picture-form.component';
import { WaitingRoomComponent } from './components/modals/waiting-room/waiting-room.component';
import { WinnerDialogComponent } from './components/modals/winner-dialog/winner-dialog.component';
import { AdminDropDbComponent } from './pages/admin-page/admin-drop-db/admin-drop-db.component';
import { AvatarPickingComponent } from './pages/connection-page/avatar-picking/avatar-picking.component';
import { ConnectionPageComponent } from './pages/connection-page/connection-page.component';
import { JokerListComponent } from './pages/game-page/board/joker-list/joker-list.component';
import { CardComponent } from './pages/game-page/cards/card/card.component';
import { CloseButtonComponent } from './pages/game-page/cards/close-button/close-button.component';
import { JokerChoiceComponent } from './pages/game-page/cards/joker-choice/joker-choice.component';
import { LetterSwapComponent } from './pages/game-page/cards/letter-swap/letter-swap.component';
import { RackSwapComponent } from './pages/game-page/cards/rack-swap/rack-swap.component';
import { SimpleCardComponent } from './pages/game-page/cards/simple-card/simple-card.component';
import { TransformTileComponent } from './pages/game-page/cards/transform-tile/transform-tile.component';
import { ExchangeComponent } from './pages/game-page/exchange/exchange.component';
import { LetterComponent } from './pages/game-page/letter/letter.component';
import { ReactionChoiceComponent } from './pages/game-page/reaction-choice/reaction-choice.component';
import { EmojiComponent } from './pages/game-page/reaction/emoji/emoji.component';
import { ReactionComponent } from './pages/game-page/reaction/reaction.component';
import { CardListComponent } from './pages/homepage/create-game/card-list/card-list.component';
import { CreateGameComponent } from './pages/homepage/create-game/create-game.component';
import { JoinGameComponent } from './pages/homepage/join-game/join-game.component';
import { LanguageSwitchComponent } from './pages/homepage/language-switch/language-switch.component';
import { TitleComponent } from './pages/homepage/title/title.component';
import { ProfileEditionPageComponent } from './pages/profile-edition-page/profile-edition-page.component';
import { ProfilePictureEditionComponent } from './pages/profile-edition-page/profile-picture-edition/profile-picture-edition.component';
import { UsernameEditionComponent } from './pages/profile-edition-page/username-edition/username-edition.component';
import { ConnectionStatisticsComponent } from './pages/statistics-page/connection-statistics/connection-statistics.component';
import { GameStatisticsComponent } from './pages/statistics-page/game-statistics/game-statistics.component';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { UserProfilePageComponent } from './pages/user-profile-page/user-profile-page.component';
import { LetterSwitchComponent } from './pages/waiting-room-page/letter-switch/letter-switch.component';
import { WaitingRoomPageComponent } from './pages/waiting-room-page/waiting-room-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        AdminDictComponent,
        GamePageComponent,
        PlayerInfoComponent,
        InfoBoxComponent,
        BoardComponent,
        HorseComponent,
        NewSoloGameFormComponent,
        NewOnlineGameFormComponent,
        HomepageComponent,
        NewGamePageComponent,
        HeaderBarComponent,
        BoldPipe,
        PreventContextMenuDirective,
        ClickAndClickoutDirective,
        MouseRollDirective,
        WaitingForPlayerComponent,
        ConvertToSoloFormComponent,
        PendingGamesComponent,
        JoinOnlineGameComponent,
        DisconnectedFromServerComponent,
        ErrorDialogComponent,
        LeaderboardComponent,
        PreventContextMenuDirective,
        ClickAndClickoutDirective,
        MouseRollDirective,
        AdminPageComponent,
        EditDictDialogComponent,
        AlertDialogComponent,
        AdminBotComponent,
        EditBotDialogComponent,
        AdminDropDbComponent,
        AddDictDialogComponent,
        AbandonDialogComponent,
        LoadingGameComponent,
        WinnerDialogComponent,
        UserProfilePageComponent,
        LoginFormComponent,
        AccountCreationFormComponent,
        GeneralChatBoxComponent,
        ProfilePictureFormComponent,
        JoinChatroomFormComponent,
        CardComponent,
        LetterSwapComponent,
        RackSwapComponent,
        JokerChoiceComponent,
        SimpleCardComponent,
        CloseButtonComponent,
        TransformTileComponent,
        CardListComponent,
        CreateGameComponent,
        JoinGameComponent,
        TitleComponent,
        ProfileEditionPageComponent,
        UsernameEditionComponent,
        ProfilePictureEditionComponent,
        LetterComponent,
        StatisticsPageComponent,
        GameStatisticsComponent,
        ConnectionStatisticsComponent,
        LanguageSwitchComponent,
        ExchangeComponent,
        JokerListComponent,
        FriendsManagerComponent,
        ConnectionPageComponent,
        AvatarPickingComponent,
        ReactionComponent,
        ReactionChoiceComponent,
        EmojiComponent,
        WaitingRoomComponent,
        WaitingRoomPageComponent,
        LetterSwitchComponent
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatTableModule,
        Ng2SearchPipeModule,
        MatSnackBarModule,
        MatMenuModule,
        MatTabsModule,

    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: () => {
                return () => {
                    return;
                };
            },
            deps: [CommandExecuterService],
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
