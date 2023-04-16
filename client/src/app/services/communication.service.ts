import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FriendInfo } from '@app/components/modals/friends-manager/friend-info.interface';
import { ChatMessage } from '@app/interfaces/chat-message';
import { ConnectionStatisticsResponse } from '@app/interfaces/connection-statistics-response.interface';
import { Conversation } from '@app/interfaces/conversation.interface';
import { Dictionary } from '@app/interfaces/dictionary';
import { GameHistory } from '@app/interfaces/game-historic-info';
import { GameStatisticsResponse } from '@app/interfaces/game-statistics-response.interface';
import { Message } from '@app/interfaces/message';
import { ProfilePictureData } from '@app/interfaces/profile-picture-data';
import { TopScore } from '@app/interfaces/top-scores';
import { AccountCreationInfo } from '@app/socket-handler/interfaces/account-creation-info.interface';
import { FriendRequest } from '@app/socket-handler/interfaces/friend-request.interface';
import { LoginInfo } from '@app/socket-handler/interfaces/login-info';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Preference } from 'src/app/interfaces/preference-response.interface';
import { VPlayerLevel, VPlayerName } from 'src/constants/virtual-player-names';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/example/send`, message).pipe(catchError(this.handleError<void>('basicPost')));
    }
    /** ************** best scores methods *******************************/

    bestScoresClassicGet(): Observable<TopScore[]> {
        return this.http
            .get<TopScore[]>(`${this.baseUrl}/api/bestScore/Classic/all`)
            .pipe(catchError(this.handleError<TopScore[]>('bestScoresClassicGet')));
    }

    bestScoresLogGet(): Observable<TopScore[]> {
        return this.http
            .get<TopScore[]>(`${this.baseUrl}/api/bestScore/log2990/all`)
            .pipe(catchError(this.handleError<TopScore[]>('bestScoresLogGet')));
    }
    bestScoresPost(topScore: TopScore, mode: string): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/api/bestScore/${mode}/send`, topScore)
            .pipe(catchError(this.handleError<void>('bestScoresPost')));
    }
    bestScoreReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/bestScore/reset`).pipe(catchError(this.handleError<void>('bestScoreReset')));
    }
    /** ************** vPlayer methods *******************************/
    gameHistoryPost(gameInfo: GameHistory): Observable<void> {
        return this.http.post<void>(`${this.baseUrl}/api/gameHistory/send`, gameInfo).pipe(catchError(this.handleError<void>('gameHistoryPost')));
    }
    gameHistoryGet(): Observable<GameHistory[]> {
        return this.http
            .get<GameHistory[]>(`${this.baseUrl}/api/gameHistory/all`)
            .pipe(catchError(this.handleError<GameHistory[]>('gameHistoryGet')));
    }
    gameHistoryReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/gameHistory/reset`).pipe(catchError(this.handleError<void>('gameHistoryReset')));
    }

    virtualPlayerNamesGet(level: VPlayerLevel): Observable<VPlayerName[]> {
        return this.http
            .get<VPlayerName[]>(`${this.baseUrl}/api/virtualPlayer/` + level + '/all')
            .pipe(catchError(this.handleError<VPlayerName[]>('virtualPlayerNamesGet')));
    }

    virtualPlayerNamePut(oldName: string, newVirtualPlayer: VPlayerName, level: VPlayerLevel) {
        return this.http
            .put<VPlayerName>(`${this.baseUrl}/api/virtualPlayer/` + level + `/modifyName/${oldName}`, newVirtualPlayer)
            .pipe(catchError(this.handleError<VPlayerName>('virtualPlayerPut', newVirtualPlayer)));
    }

    virtualPlayerNameDelete(name: VPlayerName, level: VPlayerLevel) {
        return this.http
            .delete<void>(`${this.baseUrl}/api/virtualPlayer/` + level + `/delete/${name.name}`)
            .pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }

    virtualPlayerNamePost(name: VPlayerName, level: VPlayerLevel): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/api/virtualPlayer/` + level + '/send', name)
            .pipe(catchError(this.handleError<void>('virtualPlayerNamePost')));
    }

    virtualPlayerNameReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/virtualPlayer/reset`).pipe(catchError(this.handleError<void>('virtualPlayerNameDelete')));
    }
    /** ************** Dictionary methods *******************************/
    postFile(fileToUpload: File): Observable<number> {
        const formData: FormData = new FormData();
        formData.append('fileKey', fileToUpload, fileToUpload.name);
        return this.http.post<number>(`${this.baseUrl}/api/dictionary/send`, formData).pipe(catchError(this.handleError<number>('postFile')));
    }

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(`${this.baseUrl}/api/dictionary/all`).pipe(catchError(this.handleError<Dictionary[]>('getDictionaries')));
    }

    getDictionary(title: string): Observable<Dictionary> {
        return this.http
            .get<Dictionary>(`${this.baseUrl}/api/dictionary/title/${title}`)
            .pipe(catchError(this.handleError<Dictionary>(`getDictionary title=${title}`)));
    }
    deleteDictionary(title: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/dictionary/title/${title}`).pipe(catchError(this.handleError<void>('deleteDictionary')));
    }
    putDictionary(beforeEdit: Dictionary, newInfo: Dictionary): Observable<Dictionary> {
        return this.http
            .put<Dictionary>(`${this.baseUrl}/api/dictionary/file/${beforeEdit.fileName}`, newInfo)
            .pipe(catchError(this.handleError<Dictionary>('putDictionary')));
    }
    dictionariesReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/api/dictionary/reset`).pipe(catchError(this.handleError<void>('dictionariesReset')));
    }

    /** ************** login methods *******************************/
    login(loginInfo: LoginInfo): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/login/login`, loginInfo).pipe(catchError(this.handleError<boolean>('login')));
    }

    isLoggedIn(loginInfo: LoginInfo): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/login/authentify`, loginInfo).pipe(catchError(this.handleError<boolean>('isLoggedIn')));
    }

    logout(loginInfo: LoginInfo | null): Observable<boolean> {
        return this.http.post<boolean>(`${this.baseUrl}/login/logout`, loginInfo).pipe(catchError(this.handleError<boolean>('logout')));
    }

    createAccount(accountCreationInfo: AccountCreationInfo): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/login/create-account`, accountCreationInfo)
            .pipe(catchError(this.handleError<boolean>('createAccount')));
    }

    editUsername(loginInfo: LoginInfo, newName: string): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/login/edit-username`, { currentLoginInfo: loginInfo, newName: newName })
            .pipe(catchError(this.handleError<boolean>('editUsername')));
    }

    editProfilePicture(loginInfo: LoginInfo, newId: string): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/login/edit-profile-picture`, { currentLoginInfo: loginInfo, newId: newId })
            .pipe(catchError(this.handleError<boolean>('editUsername')));
    }

    /** ************** profile picture methods *******************************/

    uploadProfilePicture(imageFileData: FormData): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/profile-picture/upload`, imageFileData)
            .pipe(catchError(this.handleError<string>('uploadProfilePicture')));
    }

    getProfilePictureData(id: number): Observable<ProfilePictureData> {
        return this.http
            .get<ProfilePictureData>(`${this.baseUrl}/profile-picture/get-data/${id}`)
            .pipe(catchError(this.handleError<ProfilePictureData>('getProfilePictureData')));
    }

    /** ************** statistics methods *******************************/

    getGameStatistics(username: string): Observable<GameStatisticsResponse> {
        return this.http
            .get<GameStatisticsResponse>(`${this.baseUrl}/statistics/game-statistics/?username=${username}`)
            .pipe(catchError(this.handleError<GameStatisticsResponse>('getGameStatistics')));
    }

    getConnectionStatistics(username: string): Observable<ConnectionStatisticsResponse> {
        return this.http
            .get<ConnectionStatisticsResponse>(`${this.baseUrl}/statistics/connection-statistics/?username=${username}`)
            .pipe(catchError(this.handleError<ConnectionStatisticsResponse>('getConnectionStatistics')));
    }

    /** ************** preference methods *******************************/

    getPreference(username: string): Observable<Preference> {
        return this.http
            .get<Preference>(`${this.baseUrl}/preference/?username=${username}`)
            .pipe(catchError(this.handleError<Preference>('getPreference')));
    }

    setPreference(username: string, usesFrench: boolean, usesDarkMode: boolean): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/preference`, { username: username, usesFrench: usesFrench, usesDarkMode: usesDarkMode })
            .pipe(catchError(this.handleError<boolean>('setPreference')));
    }

    /** ************** conversations methods *******************************/

    conversationCreate(conversation: Conversation): Observable<Conversation> {
        return this.http
            .post<Conversation>(`${this.baseUrl}/conversation/addConversation`, conversation)
            .pipe(catchError(this.handleError<Conversation>('addConversation')));
    }

    conversationCreateChatRoom(conversation: Conversation): Observable<unknown> {
        return this.http
            .post<unknown>(`${this.baseUrl}/conversation/addChatRoom`, conversation)
            .pipe(catchError(this.handleError<void>('conversationPost')));
    }

    conversationDeleteChatRoom(conversation: Conversation): Observable<Conversation> {
        return this.http
            .post<Conversation>(`${this.baseUrl}/conversation/deleteChatRoom`, { conversation: conversation })
            .pipe(catchError(this.handleError<Conversation>('deleteChatRoom')));
    }

    conversationDelete(conversationId: string): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/conversation/deleteConversation`, { conversationId: conversationId })
            .pipe(catchError(this.handleError<string>('deleteConversation')));
    }

    conversationAddToConversationsList(user: string, conversationName: string, type: string): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/conversation/addToConversationsList`, { user, conversationName, type })
            .pipe(catchError(this.handleError<string>('addToConversationsList')));
    }

    removeConversationFromAllUsers(conversationId: string, type: string): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/conversation/removeConversationFromAllUsers`, { conversationId: conversationId, type: type })
            .pipe(catchError(this.handleError<string>('removeConversationFromAllUsers')));
    }

    checkChatRoomName(conversationName: string): Observable<{ exist: boolean }> {
        return this.http.post<{ exist: boolean }>(`${this.baseUrl}/conversation/checkChatRoomName`, { conversationName });
    }

    checkConversationExist(currentUsername: string, friendUsername: string): Observable<{ exist: boolean }> {
        return this.http.post<{ exist: boolean }>(`${this.baseUrl}/conversation/checkConversationExist`, { currentUsername, friendUsername });
    }

    conversationGet(user: string): Observable<Conversation[]> {
        return this.http
            .get<Conversation[]>(`${this.baseUrl}/conversation/all/?username=${user}`)
            .pipe(catchError(this.handleError<Conversation[]>('conversationGet')));
    }

    conversationReset(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/conversation/reset`).pipe(catchError(this.handleError<void>('conversationReset')));
    }

    chatRoomConversationGet(): Observable<Conversation[]> {
        return this.http
            .get<Conversation[]>(`${this.baseUrl}/conversation/chatroom`)
            .pipe(catchError(this.handleError<Conversation[]>('conversationGet')));
    }

    conversationGetMessages(roomId: string): Observable<ChatMessage[]> {
        return this.http
            .get<ChatMessage[]>(`${this.baseUrl}/conversation/conversationGetMessages/?conversationId=${roomId}`)
            .pipe(catchError(this.handleError<ChatMessage[]>('getFriendRequests')));
    }

    /** ************** Friends Manager methods *******************************/

    getFriendsList(username?: string): Observable<FriendInfo[]> {
        return this.http
            .get<FriendInfo[]>(`${this.baseUrl}/friendRequestManager/getFriendsList/?username=${username}`)
            .pipe(catchError(this.handleError<FriendInfo[]>('getFriendsList')));
    }

    getFriendRequests(username?: string): Observable<FriendRequest[]> {
        return this.http
            .get<FriendRequest[]>(`${this.baseUrl}/friendRequestManager/getFriendRequests/?username=${username}`)
            .pipe(catchError(this.handleError<FriendRequest[]>('getFriendRequests')));
    }

    sendFriendRequest(friendRequest: FriendRequest): Observable<FriendRequest> {
        return this.http
            .post<FriendRequest>(`${this.baseUrl}/friendRequestManager/sendFriendRequest`, friendRequest)
            .pipe(catchError(this.handleError<FriendRequest>('friendRequestManager')));
    }

    // accept friend request from friendsManagerService and post to server
    updateFriendRequest(friendRequest: FriendRequest): Observable<FriendRequest> {
        return this.http
            .post<FriendRequest>(`${this.baseUrl}/friendRequestManager/updateFriendRequest`, friendRequest)
            .pipe(catchError(this.handleError<FriendRequest>('updateFriendRequest')));
    }

    // update friend list from friendsManagerService and post to server
    updateFriendsList(user: string, friend: string, action: string): Observable<any> {
        return this.http
            .post<any>(`${this.baseUrl}/friendRequestManager/updateFriendsList`, { user, friend, action })
            .pipe(catchError(this.handleError<any>('updateFriendsList')));
    }

    // check if username exist in database
    checkUserExist(username: string): Observable<boolean> {
        return this.http
            .get<boolean>(`${this.baseUrl}/friendRequestManager/checkUsernameExist/?username=${username}`)
            .pipe(catchError(this.handleError<boolean>('checkUsernameExist')));
    }

    //check on database if the friend request has already been sent by the sender to the receiver
    checkFriendRequestExist(friendRequest: FriendRequest): Observable<boolean> {
        return this.http
            .post<boolean>(`${this.baseUrl}/friendRequestManager/checkFriendRequestExist`, friendRequest)
            .pipe(catchError(this.handleError<boolean>('checkFriendRequestExist')));
    }

    deleteConversationFromList(user: string, conversationName: string): Observable<string> {
        return this.http
            .post<string>(`${this.baseUrl}/conversation/deleteConversationFromList`, { user, conversationName })
            .pipe(catchError(this.handleError<string>('deleteConversationFromList')));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }


}
