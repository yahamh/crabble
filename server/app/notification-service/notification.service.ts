import { FriendRequest } from '@app/interfaces/friend-request.interface';
//import { LoginInfo } from '@app/login/interfaces/login-info.interface';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';

export interface LoginAndSocket {
    userName: string,
    socket: io.Socket
}

@Service()
export class NotificationService {
    sio: io.Server;

    connectedUsers: LoginAndSocket[] = []

    connectServer(server: http.Server) {
        this.sio = new io.Server(server, {
            path: '/socketNotifications',
            cors: { origin: '*', methods: ['GET', 'POST'] },
            pingTimeout: 5000,
        });

        this.sio.on('connection', (socket) => {
            let socketLoginInfo: LoginAndSocket;
            socket.on('friendsManagerSocketJoin', async (userName: string) => {
                this.connectedUsers.push({ userName: userName, socket: socket });
                socketLoginInfo = { userName: userName, socket: socket };
            });
            socket.on('disconnect', async () => {
                if (socketLoginInfo) {
                    this.connectedUsers = this.connectedUsers.filter(value => value.socket != socket);
                }
            })
        });
    }

    notifyFriendRequest(userToBeNotified: string, friendRequest: FriendRequest) {
        this.connectedUsers.filter(value => value.userName == userToBeNotified).map(v => v.socket).forEach(v => v.emit('newFriendRequest', friendRequest));
    }

    deleteFriendNotification(userToBeNotified: string, friendToBeDeleted: string) {
        this.connectedUsers.filter(value => value.userName == userToBeNotified).map(v => v.socket).forEach(v => v.emit('deleteFriend', friendToBeDeleted));
    }

    notifyFriendRequestAccepted(userToBeNotified: string, friendToBeAdded: string) {
        this.connectedUsers.filter(value => value.userName == userToBeNotified).map(v => v.socket).forEach(v => v.emit('friendRequestAccepted', friendToBeAdded));
    }

    notifyNewMessage(userToBeNotified: string) {
        this.connectedUsers.filter(value => value.userName == userToBeNotified).map(v => v.socket).forEach(v => v.emit('newMessageRequest'));
    }
}
