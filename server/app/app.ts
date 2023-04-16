import { BotInfoController } from '@app/controllers/bot-info.controller';
import { DebugController } from '@app/controllers/debug.controller';
import { DictionaryController } from '@app/controllers/dictionary.controller';
import { LeaderboardController } from '@app/controllers/leaderboard.controller';
import { HttpException } from '@app/utils/http.exception';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { StatusCodes } from 'http-status-codes';
import * as logger from 'morgan';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { ConversationController } from './chat/conversation.controller';
import { FriendsManagerController } from './controllers/friends-manager.controller';
import { LoginController } from './controllers/login.controller';
import { PreferenceController } from './controllers/preference.controller';
import { StatisticsController } from './controllers/statistics.controller';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options = {
        swaggerDefinition: {
            openapi: '3.0.0',
            info: {
                title: 'Cadriciel Serveur',
                version: '1.0.0',
            },
        },
        apis: ['**/*.ts'],
    };

    constructor(
        private readonly debugController: DebugController,
        private readonly leaderboardController: LeaderboardController,
        private readonly botInfoController: BotInfoController,
        private readonly dictionaryController: DictionaryController,
        private readonly loginController: LoginController,
        private readonly conversationController: ConversationController,

        private readonly statisticsController: StatisticsController,
        private readonly friendsManagerController: FriendsManagerController,
        private readonly preferenceController: PreferenceController,
    ) {
        this.app = express();
        this.config();
        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/servergame', this.debugController.router);
        this.app.use('/api/scores', this.leaderboardController.router);
        this.app.use('/api/botinfo', this.botInfoController.router);
        this.app.use('/api/dictionary', this.dictionaryController.router);
        this.app.use('/api/login', this.loginController.router);
        this.app.use('/api/conversation', this.conversationController.router);
        this.app.use('/api/conversation/checkChatRoomName', this.conversationController.router);
        this.app.use('/api/conversation/chatroom', this.conversationController.router);
        this.app.use('/api/statistics', this.statisticsController.router);
        this.app.use('/api/friendRequestManager', this.friendsManagerController.router);
        this.app.use('/api/getFriendRequests', this.friendsManagerController.router);
        this.app.use('/api/updateFriendRequest', this.friendsManagerController.router);
        this.app.use('/api/getFriendsList', this.friendsManagerController.router);
        this.app.use('/api/updateFriendsList', this.friendsManagerController.router);
        this.app.use('/api/checkUsernameExist', this.friendsManagerController.router);
        this.app.use('/api/checkFriendRequestExist', this.friendsManagerController.router);
        this.app.use('/api/preference', this.preferenceController.router);

        this.app.use('/', (req, res) => {
            res.redirect('/api/docs');
        });
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
