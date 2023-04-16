import { DatabaseService } from '@app/database/database.service';
import { Collection } from 'mongodb';
import { Service } from 'typedi';
import { PREFERENCE_COLLECTION } from './preference-constants';

@Service()
export class PreferenceService {
    constructor(private databaseService: DatabaseService) {}

    async getPreference(userId: string): Promise<Preference | undefined> {
        try {
            const collection = this.getPreferenceCollection();
            const match = await collection.findOne({ playerId: userId });
            if (match == null) return { usesDarkMode: true, usesFrench: true };
            return match.preference;
        } catch (e) {
            return { usesDarkMode: true, usesFrench: true };
        }
    }

    async setPreference(userId: string, preference: Preference): Promise<boolean> {
        try {
            const collection = this.getPreferenceCollection();
            if ((await collection.findOne({ playerId: userId })) != null) {
                await collection.updateOne({ playerId: userId }, { $set: { preference: preference } });
            } else {
                await collection.insertOne({ playerId: userId, preference: preference });
            }
            return true;
        } catch (e) {
            return false;
        }
    }

    private getPreferenceCollection(): Collection<PreferenceEntry> {
        return this.databaseService.database.collection(PREFERENCE_COLLECTION);
    }
}
