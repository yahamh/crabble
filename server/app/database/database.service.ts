import { BOT_INFO_COLLECTION } from '@app/constants';
import { DB_COLLECTION_CHATROOMS, DB_COLLECTION_CONVERSATIONS } from '@app/constants/constants';
import { DEFAULT_EASY_BOT, DEFAULT_EXPERT_BOT } from '@app/database/bot-info/default-bot-names';
import {
    DEFAULT_LEADERBOARD_CLASSIC,
    DEFAULT_LEADERBOARD_LOG,
    LEADERBOARD_CLASSIC_COLLECTION,
    LEADERBOARD_LOG_COLLECTION
} from '@app/database/leaderboard-service/leaderboard-constants';
import { LOGIN_COLLECTION } from '@app/login/login-constants';
import { CollectionInfo, Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';
import { TEST_CHATROOM, TEST_CONVERSATIONS } from './conversation-service/conversations-constants';

const DB_USER = 'admin';
const DB_PSW = 'admin';
const CLUSTER_URL = 'cluster0.vlpsr.mongodb.net';

export const DATABASE_URL = `mongodb+srv://${DB_USER}:${DB_PSW}@${CLUSTER_URL}/<myFirstDatabase>?retryWrites=true&w=majority`;
export const DATABASE_NAME = 'LOG2990';

@Service()
export class DatabaseService {
    private db: Db;

    async start(url: string = DATABASE_URL) {
        try {
            const client = await MongoClient.connect(url);
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        this.createLeaderboardCollection(LEADERBOARD_CLASSIC_COLLECTION);
        this.createLeaderboardCollection(LEADERBOARD_LOG_COLLECTION);
        this.createBotInfoCollection();
        this.createLoginCollection();
        this.createConversationCollection(DB_COLLECTION_CONVERSATIONS);
        this.createChatRoomCollection(DB_COLLECTION_CHATROOMS);
    }

    private async createLoginCollection() {
        try {
            const collectionExists = await this.isCollectionInDb(LOGIN_COLLECTION);
            if (collectionExists) {
                return;
            }
            await this.db.createCollection(LOGIN_COLLECTION);
            await this.db.collection(LOGIN_COLLECTION).createIndex({ name: 1 }, { unique: true });
        } catch (error) {
            throw Error('Login data base collection creation error');
        }
    }

    private async createLeaderboardCollection(collectionName: string): Promise<void> {
        try {
            const collectionExists = await this.isCollectionInDb(collectionName);
            if (collectionExists) {
                return;
            }
            await this.db.createCollection(collectionName);
            await this.db.collection(collectionName).createIndex({ name: 1 }, { unique: true });
            await this.populateLeaderboardCollection(collectionName);
        } catch (e) {
            throw Error('Data base collection creation error');
        }
    }

    private async isCollectionInDb(name: string): Promise<boolean> {
        const collections = await this.db.listCollections().toArray();
        const collection = collections.find((collectionInDb: CollectionInfo) => collectionInDb.name === name);
        return collection !== undefined;
    }

    private async createBotInfoCollection() {
        try {
            const collectionExists = await this.isCollectionInDb(BOT_INFO_COLLECTION);
            if (collectionExists) {
                return;
            }
            await this.db.createCollection(BOT_INFO_COLLECTION);
            await this.db.collection(BOT_INFO_COLLECTION).createIndex({ name: 1 }, { unique: true });
            this.populateBotInfoCollection();
        } catch (error) {
            throw Error('Data base collection creation error');
        }
    }

    private async populateBotInfoCollection() {
        try {
            await this.db.collection(BOT_INFO_COLLECTION).insertMany(DEFAULT_EASY_BOT);
            await this.db.collection(BOT_INFO_COLLECTION).insertMany(DEFAULT_EXPERT_BOT);
        } catch (error) {
            throw Error('Data base collection population error');
        }
    }

    private async populateLeaderboardCollection(name: string): Promise<void> {
        try {
            const defaultPopulation = name === LEADERBOARD_CLASSIC_COLLECTION ? DEFAULT_LEADERBOARD_CLASSIC : DEFAULT_LEADERBOARD_LOG;
            if ((await this.db.collection(name).countDocuments()) === 0) {
                await this.db.collection(name).insertMany(defaultPopulation);
            }
        } catch (e) {
            throw Error('Data base collection population error');
        }
    }

    private async populateConversationCollection(name: string): Promise<void> {
        try {
            const defaultPopulation = TEST_CONVERSATIONS;
            if ((await this.db.collection(name).countDocuments()) === 0) {
                await this.db.collection(name).insertMany(defaultPopulation);
            }
        } catch (e) {
            throw Error('Data base collection population error');
        }
    }

    private async createConversationCollection(collectionName: string): Promise<void> {
        try {
            const collectionExists = await this.isCollectionInDb(collectionName);
            if (collectionExists) {
                return;
            }
            await this.db.createCollection(collectionName);
            await this.db.collection(collectionName).createIndex({ name: 1 }, { unique: true });
            await this.populateConversationCollection(collectionName);
        } catch (e) {
            throw Error('Data base collection creation error');
        }
    }

    private async populateChatRoomCollection(name: string): Promise<void> {
        try {
            const defaultPopulation = TEST_CHATROOM;
            if ((await this.db.collection(name).countDocuments()) === 0) {
                await this.db.collection(name).insertMany(defaultPopulation);
            }
        } catch (e) {
            throw Error('Data base collection population error');
        }
    }

    private async createChatRoomCollection(collectionName: string): Promise<void> {
        try {
            const collectionExists = await this.isCollectionInDb(collectionName);
            if (collectionExists) {
                return;
            }
            await this.db.createCollection(collectionName);
            await this.db.collection(collectionName).createIndex({ name: 1 }, { unique: true });
            await this.populateChatRoomCollection(collectionName);
        } catch (e) {
            throw Error('Data base collection creation error');
        }
    }

    get database(): Db {
        return this.db;
    }
}
