import { LoginService } from '@app/login/login.service';
import { StatisticsService } from '@app/statistics/statistics.service';
import { Router } from 'express';
import { Service } from 'typedi';

@Service()
export class StatisticsController {
    router: Router;

    constructor(private statisticsServerService: StatisticsService, private loginService: LoginService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/game-statistics/', async (req, response) => {
            const username = req.query.username as string;
            const id = await this.loginService.getIdByUsername(username);
            response.send(await this.statisticsServerService.getGameStatistics(id));
        });

        this.router.get('/connection-statistics/', async (req, response) => {
            const username = req.query.username as string;
            const id = await this.loginService.getIdByUsername(username);
            response.send(await this.statisticsServerService.getConnectionStatistics(id));
        });
    }
}
