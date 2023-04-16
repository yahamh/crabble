import { LoginService } from '@app/login/login.service';
import { PreferenceService } from '@app/preference/preference.service';
import { Router } from 'express';
import { Service } from 'typedi';

@Service()
export class PreferenceController {
    router: Router;

    constructor(private loginService: LoginService, private preferenceService: PreferenceService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', async (req, response) => {
            const username = req.query.username as string;
            const id = await this.loginService.getIdByUsername(username);
            response.send(await this.preferenceService.getPreference(id));
        });

        this.router.post('/', async (req, response) => {
            const prefSet: PreferenceSet = req.body;
            const preference: Preference = { usesDarkMode: prefSet.usesDarkMode, usesFrench: prefSet.usesFrench };
            const id = await this.loginService.getIdByUsername(prefSet.username);
            response.send(await this.preferenceService.setPreference(id, preference));
        });
    }
}
