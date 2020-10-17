const { Pool } = require('pg');

const credentials = require('../../config.json').pgCredentials;

class Database {
    constructor(client) {
        this.client = client;
        this.pool = new Pool({
            user: credentials.user,
            host: credentials.host,
            database: credentials.database,
            password: credentials.password,
            port: credentials.port
        });

        this.pool.on('connect', () => {
            this.client.logger.info('Connected to Postgres database.')
        })
    };

    async getGuild (id) {
        return await this.pool.query('SELECT * FROM guilds WHERE guild_id = $1;', [id]);
    };

    async getGuildField (id, field) {
        let res = await this.pool.query('SELECT $1 FROM guilds WHERE guild_id = $2;', [field, id]);
    };

    async getMember (guildID, userID) {

    };

    async getUser (id) {
        
    };


};

module.exports = Database;