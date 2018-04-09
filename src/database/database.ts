import { Sequelize } from 'sequelize-typescript';
import { logger, Logger } from 'yamdbf';

/**
 * Manages the sequelize connection to the main database.
 */
export class Database {
    private static _instance: Database;
    private db: Sequelize;
    @logger private readonly _logger: Logger;

    private constructor(private url: string) {
        if (Database._instance) throw new Error('Cannot create multiple instances of Database.');

        Database._instance = this;

        this.db = new Sequelize(this.url);
        this.db.addModels([`${__dirname}/models`]);
    }

    /**
     * Get the sequelize instance.
     */
    static get db(): Sequelize {
        return Database.instance().db;
    }

    /**
     * Returns the {@link Database} instance
     * containing the sequelize connection.
     * @param url The database url.
     */
    static instance(url?: string): Database {
        if (!url && !Database._instance)
            throw new Error('A url is required the first time the database is accessed.');
        if (this._instance) return this._instance;

        return new Database(url);
    }

    /**
     * Authenticate the connection and sync database.
     */
    async init(): Promise<void> {
        try {
            await this.db.authenticate();
        } catch (err) {
            await this._logger.error(`Failed to connect to database ${err}`);
            process.exit();
        }
        await this.db.sync();
    }
}
