import { Conversation } from '@app/chat/conversation.interface';
import { ConversationService } from '@app/chat/conversation.service';
import { DatabaseService } from '@app/database/database.service';
import { ConnectionStatisticsEntry } from '@app/interfaces/connection-statistics-entry.interface';
import { StatisticsService } from '@app/statistics/statistics.service';
import * as http from 'http';
import { Collection, ObjectId } from 'mongodb';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { AccountCreationInfo } from './interfaces/account-creation-info.interface';
import { FriendInfo } from './interfaces/friend-info.inteface';
import { LoginInfo } from './interfaces/login-info.interface';
import { LOGIN_COLLECTION } from './login-constants';
import { PasswordEncryption } from './password-encryption';

// export interface LoginAndSocket {
//     loginInfo: LoginInfo,
//     socket: io.Socket
// }

@Service()
export class LoginService {
    sio: io.Server;
    
    friend: FriendInfo = { username: "", conversationId: "" };
    connectedUsers: LoginInfo[] = []

    constructor(private databaseService: DatabaseService, private statsService: StatisticsService, private conversationService: ConversationService) {}

    connectServer(server: http.Server) {
        this.sio = new io.Server(server, {
            path: '/socketAccount',
            cors: { origin: '*', methods: ['GET', 'POST'] },
            pingTimeout: 5000,
        });

        this.sio.on('connection', (socket) => {
            let socketLoginInfo: LoginInfo;

            socket.on('login', async (loginInfo: LoginInfo) => {
                if (this.isAlreadyConnected(loginInfo)) {
                    socket.emit('login', false);
                } else {
                    loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
                    let authenticated = await this.authentificateInfo(loginInfo);
                    socket.emit('login', authenticated);

                    if (authenticated) {
                        const connectionStat: ConnectionStatisticsEntry = {
                            playerId: await this.getIdByUsername(loginInfo.username),
                            date: new Date().toString(),
                            connectionStatisticsType: 'connection',
                        };
                        await this.statsService.addConnectionStatistics(connectionStat);
                        socketLoginInfo = {
                            username: loginInfo.username,
                            password: loginInfo.password,
                        };

                        this.connectedUsers.push(loginInfo);
                    }
                }
            });

            socket.on('requestAccountData', async (username: string) => {
                let accountData = await this.getAccountData({ username: username, password: '' });
                socket.emit(`accountData${username}`, accountData);
            });

            socket.on('disconnect', async () => {
                if (socketLoginInfo) {
                    const connectionStat: ConnectionStatisticsEntry = {
                        playerId: await this.getIdByUsername(socketLoginInfo.username),
                        date: new Date().toString(),
                        connectionStatisticsType: 'deconnection',
                    };
                    this.statsService.addConnectionStatistics(connectionStat);

                    this.connectedUsers = this.connectedUsers.filter((value) => value.username != socketLoginInfo.username);
                }
            });
        });
    }

    isAlreadyConnected(loginInfo: LoginInfo): boolean {
        return this.connectedUsers.find((value) => value.username == loginInfo.username) != undefined;
    }

    async authentificateInfo(loginInfo: LoginInfo): Promise<boolean> {
        try {
            const collection = this.getLoginCollection();
            const match = await collection.findOne(loginInfo);
            return match != null;
        } catch (e) {
            return false;
        }
    }

    async getAccountData(loginInfo: LoginInfo): Promise<AccountCreationInfo | null> {
        try {
            const collection = this.getLoginCollection();
            const match = await collection.findOne(loginInfo.password == '' ? { username: loginInfo.username } : loginInfo);
            return match;
        } catch (e) {
            return null;
        }
    }

    async addAccount(accountCreationInfo: AccountCreationInfo): Promise<boolean> {
        try {
            const collection = this.getLoginCollection();
            const match = await collection.findOne({ username: accountCreationInfo.username });
            if (match == null) {
                await collection.insertOne(accountCreationInfo);
                return true;
            }
            else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }

    async getIdByUsername(username: string): Promise<string> {
        try {
            const match = await this.databaseService.database.collection(LOGIN_COLLECTION).findOne({ username: username });
            if (match == null) return '';
            else return match._id;
        } catch (e) {
            return '';
        }
    }

    async getUsernameById(id: string): Promise<string> {
        const match = await this.getLoginCollection().findOne({ _id: new ObjectId(id) });
        if (match == null) return '';
        else return match.username;
    }

    async nameAlreadyUsed(username: string): Promise<boolean> {
        try {
            const match = await this.databaseService.database.collection(LOGIN_COLLECTION).findOne({ username: username });
            return match != null;
        } catch (e) {
            return true;
        }
    }

    async applyNameChange(loginInfo: LoginInfo, newName: string): Promise<boolean> {
        try {
            let connectedUser = this.connectedUsers.find((u) => u.username == loginInfo.username);
            if (connectedUser) {
                connectedUser.username = newName;
            }
            const collection = this.databaseService.database.collection(LOGIN_COLLECTION);
            await collection.updateOne({ username: loginInfo.username, password: loginInfo.password }, { $set: { username: newName } });
            return true;
        } catch (e) {
            return false;
        }
    }

    async applyProfilePictureChange(loginInfo: LoginInfo, newId: string): Promise<boolean> {
        try {
            const collection = this.databaseService.database.collection(LOGIN_COLLECTION);
            await collection.updateOne({ username: loginInfo.username, password: loginInfo.password }, { $set: { profilePictureId: newId } });
            return true;
        } catch (e) {
            return false;
        }
    }

    async getCollectionFriendsList(user: string): Promise<any> {
        let collection = this.getLoginCollection();
        let match = await collection.findOne({ username: user });
        // change the id to username in match with the method getUsernameById
        if (match?.friendsList != undefined) {
            for (let friend of match?.friendsList) {
                friend.username = await this.getUsernameById(friend.username);
            }
        }
        return match?.friendsList;
    }

    private getLoginCollection(): Collection<AccountCreationInfo> {
        return this.databaseService.database.collection(LOGIN_COLLECTION);
    }

    // check if user exists on database
    async checkUserExist(username: string): Promise<boolean> {
        try {
            const collection = this.getLoginCollection();
            const match = await collection.findOne({ username: username });
            return match != null;
        } catch (e) {
            return false;
        }
    }
    async getConversations(user: string): Promise<Conversation[]> {
        let collection = this.getLoginCollection();
        let match = await collection.findOne({ username: user });
        if (match == null) return [];

        let conversations: Conversation[] = [];
        for (let conversation of match.conversations) {
            let conversationData = await this.conversationService.getConversation(conversation);
            if (conversationData != null) {
                conversations.push(conversationData);
            }
        }


        return conversations;
    }

    async addConversationToUser(user: string, conversation: Conversation) {
        console.log('pipo', await this.getIdByUsername(conversation.owner ?? ''));
        console.log('user', user.toString());

        await this.getLoginCollection().updateOne({ _id: user }, { $push: { conversations: conversation.roomId } });
        // find user in the db and add the conversation to his conversations
        if (conversation.type == 'private') {
            if (user == (await this.getIdByUsername(conversation.owner ?? '')).toString()) {
                console.log("if", user);

                this.friend.conversationId = conversation.roomId ?? '';
                await this.getLoginCollection().updateOne({ _id: new ObjectId(user), 'friendsList.username': conversation.participants[1] }, { $set: { 'friendsList.$.conversationId': conversation.roomId ?? '' } });
            } else {
                console.log("else", user);
                await this.getLoginCollection().updateOne({ _id: new ObjectId(user), 'friendsList.username': conversation.participants[0] }, { $set: { 'friendsList.$.conversationId': conversation.roomId ?? '' } });
            }
        }
    }


    async deleteConversationFromUser(username: string, conversationName: string) {
        console.log("sdfasd")
        console.log(username);
        console.log(conversationName);
        await this.getLoginCollection().updateOne({ _id: new ObjectId(username) }, { $pull: { conversations: conversationName } });
    }

    async updateFriendsList(user: string, friend: string, action: string) {
        this.friend.username = friend;
        this.friend.conversationId = "";
        if (action == "add") {
            this.getLoginCollection().updateOne({ _id: new ObjectId(user) }, { $push: { friendsList: this.friend } });
        } else if (action == "remove") {
            this.getLoginCollection().updateOne({ _id: new ObjectId(user) }, { $pull: { friendsList: { username: friend } } });
        }
    }
}
