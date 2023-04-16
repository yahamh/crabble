import { ConnectionStatisticsEntry } from '@app/interfaces/connection-statistics-entry.interface';
import { AccountCreationInfo } from '@app/login/interfaces/account-creation-info.interface';
import { LoginInfo } from '@app/login/interfaces/login-info.interface';
import { LoginService } from '@app/login/login.service';
import { PasswordEncryption } from '@app/login/password-encryption';
import { StatisticsService } from '@app/statistics/statistics.service';
import { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

const MAINCHAT_ID = '1';

@Service()
export class LoginController {
    router: Router;

    constructor(private loginService: LoginService, private statsService: StatisticsService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        /*
        this.router.post('/login', async (req: Request, res: Response) => {
            const loginInfo: LoginInfo = req.body;
            loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
            const isAuthentified = await this.loginService.authentificateInfo(loginInfo);
            const alreadyConnected = await this.currentLoginService.isConnected(loginInfo);

            console.log(`Already connected? ${alreadyConnected}`);
            console.log(`Authentified? ${isAuthentified}`);

            if (!alreadyConnected && isAuthentified) {
                const connectionSuccessful = await this.currentLoginService.addConnection(loginInfo);
                if (connectionSuccessful) {
                    const connectionStat: ConnectionStatisticsEntry = {
                        playerId: await this.loginService.getIdByUsername(loginInfo.username),
                        date: new Date().toString(),
                        connectionStatisticsType: 'connection',
                    };
                    this.statsService.addConnectionStatistics(connectionStat);
                }
                res.send(connectionSuccessful);
            } else {
                res.status(StatusCodes.FORBIDDEN).send(false);
            }
        });*/

        // To be used to verify login info of someone who's already logged in.
        this.router.post('/authentify', async (req: Request, res: Response) => {
            const loginInfo: LoginInfo = req.body;
            loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
            const isAuthentified = await this.loginService.authentificateInfo(loginInfo);
            const alreadyConnected = await this.loginService.isAlreadyConnected(loginInfo);
            if (alreadyConnected && isAuthentified) {
                res.status(StatusCodes.OK).send(true);
            } else {
                res.status(StatusCodes.FORBIDDEN).send(false);
            }
        });

        /*
        this.router.post('/logout', async (req: Request, res: Response) => {
            const loginInfo: LoginInfo = req.body;
            loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
            const isAuthentified = await this.loginService.authentificateInfo(loginInfo);
            if (isAuthentified) {
                const connectionStat: ConnectionStatisticsEntry = {
                    playerId: await this.loginService.getIdByUsername(loginInfo.username),
                    date: new Date().toString(),
                    connectionStatisticsType: 'deconnection',
                };
                this.statsService.addConnectionStatistics(connectionStat);
                res.send(await this.currentLoginService.removeConnection(loginInfo));
            } else {
                res.status(StatusCodes.NOT_FOUND).send(false);
            }
        });*/

        this.router.post('/create-account', async (req: Request, res: Response) => {
            const accountCreationInfo: AccountCreationInfo = req.body;
            accountCreationInfo.password = PasswordEncryption.encryptPassword(accountCreationInfo.password);
            accountCreationInfo.conversations = [MAINCHAT_ID];

            const creationSuccessful = await this.loginService.addAccount(accountCreationInfo);
            if (creationSuccessful) {
                const connectionStat: ConnectionStatisticsEntry = {
                    playerId: await this.loginService.getIdByUsername(accountCreationInfo.username),
                    date: new Date().toString(),
                    connectionStatisticsType: 'connection',
                };
                await this.statsService.addConnectionStatistics(connectionStat);
                res.send(creationSuccessful);
            } else {
                res.status(StatusCodes.CONFLICT).send(creationSuccessful);
            }
        });

        this.router.post('/edit-username', async (req: Request, res: Response) => {
            const loginInfo = req.body.currentLoginInfo;
            const newName = req.body.newName;
            loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
            const authentified = await this.loginService.authentificateInfo(loginInfo);
            if (authentified) {
                const newNameAlreadyUsed = await this.loginService.nameAlreadyUsed(newName);
                if (!newNameAlreadyUsed) {
                    res.send(await this.loginService.applyNameChange(loginInfo, newName));
                } else {
                    res.status(StatusCodes.CONFLICT).send(false);
                }
            } else {
                res.status(StatusCodes.UNAUTHORIZED).send(false);
            }
        });

        this.router.post('/edit-profile-picture', async (req: Request, res: Response) => {
            const loginInfo = req.body.currentLoginInfo;
            const newId = req.body.newId;
            loginInfo.password = PasswordEncryption.encryptPassword(loginInfo.password);
            const authentified = await this.loginService.authentificateInfo(loginInfo);
            if (authentified) {
                res.send(await this.loginService.applyProfilePictureChange(loginInfo, newId));
            } else {
                res.status(StatusCodes.UNAUTHORIZED).send(false);
            }
        });
    }
}
