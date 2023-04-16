import { DatabaseService } from '@app/database/database.service';
import { LoginInfo } from '@app/login/interfaces/login-info.interface';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { CURRENT_LOGIN_COLLECTION } from './login-constants';

@Service()
export class CurrentLoginService {
    constructor(private databaseService: DatabaseService) {}

    async addConnection(loginInfo: LoginInfo): Promise<boolean> {
        try {
            const collection = this.getCurrentLoginCollection();
            const match = await collection.findOne(loginInfo);
            if (!match) {
                collection.insertOne(loginInfo);
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    async removeConnection(loginInfo: LoginInfo): Promise<boolean> {
        try {
            const collection = this.getCurrentLoginCollection();
            const result = await collection.deleteOne(loginInfo);
            return result.deletedCount == 1;
        } catch (e) {
            return false;
        }
    }

    async isConnected(loginInfo: LoginInfo): Promise<boolean> {
        try {
            const collection = this.getCurrentLoginCollection();
            const match = await collection.findOne(loginInfo);
            return match != null;
        } catch (e) {
            return false;
        }
    }

    private getCurrentLoginCollection(): Collection<LoginInfo> {
        return this.databaseService.database.collection(CURRENT_LOGIN_COLLECTION);
    }
}
