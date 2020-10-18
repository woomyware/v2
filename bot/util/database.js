/* eslint-disable no-unused-vars */

const { Pool } = require('pg');
const format = require('pg-format');
const { level } = require('winston');
const { pgCredentials } = require('../../config.json');

class Database {
    constructor (client) {
        this.client = client;
        this.pool = new Pool(pgCredentials);

        this.pool.on('error', err => {
            this.client.logger.error('Postgres error: ' + err);
        });
    }

    async getGuild (id) {
        const res = await this.pool.query('SELECT * FROM guilds WHERE guild_id = $1;', [id]);
        return res.rows[0];
    }

    async getMember (guild_id, user_id) {
        const key = guild_id + ':' + user_id;
        const res = await this.pool.query('SELECT * FROM members WHERE member_id = $1;', [key]);
        return res.rows[0];
    }

    async getUser (id) {
        const res = await this.pool.query('SELECT * FROM users WHERE user_id = $1;', [id]);
        return res.rows[0];
    }

    async getGuildField (id, column) {
        const sql = format('SELECT %I FROM guilds WHERE guild_id = $1;', column);
        const query = {
            text: sql,
            values: [id],
            rowMode: 'array'
        };

        const res = await this.pool.query(query);

        return res.rows[0][0];
    }

    async getMemberField (guild_id, user_id, column) {
        const key = guild_id + ':' + user_id;
        const sql = format('SELECT %I FROM members WHERE member_id = $1;', column);
        const query = {
            text: sql,
            values: [key],
            rowMode: 'array'
        };

        const res = await this.pool.query(query);

        return res.rows[0][0];
    }

    async getUserField (id, column) {
        const sql = format('SELECT %I FROM users WHERE user_id = $1;', column);
        const query = {
            text: sql,
            values: [id],
            rowMode: 'array'
        };

        const res = await this.pool.query(query);

        return res.rows[0][0];
    }

    async updateGuild (id, column, newValue) {
        const sql = format('UPDATE guilds SET %I = $1 WHERE guild_id = $2;', column);
        await this.pool.query(sql, [newValue, id]);
        return;
    }

    async updateMember (guild_id, user_id, column, newValue) {
        const key = guild_id + ':' + user_id;
        const sql = format('UPDATE members SET %I = $1 WHERE member_id = $2;', column);
        await this.pool.query(sql, [newValue, key]);
        return;
    }

    async updateUser (id, column, newValue) {
        const sql = format('UPDATE users SET %I = $1 WHERE user_id = $2;', column);
        await this.pool.query(sql, [newValue, id]);
        return;
    }

    async resetGuild (id, column) {
        const regexp = /(?<=\')(.*?)(?=\')/; //eslint-disable-line no-useless-escape
        const res = await this.client.db.pool.query(
            'SELECT column_default FROM information_schema.columns WHERE table_name=\'guilds\' AND column_name = $1;', [column]);
        const def = res.rows[0].column_default.match(regexp)[0];

        await this.updateGuild(id, column, def);

        return;
    }

    async resetMember (guild_id, user_id, column) {
        const key = guild_id + ':' + user_id;
        const regexp = /(?<=\')(.*?)(?=\')/; //eslint-disable-line no-useless-escape
        const res = await this.client.db.pool.query(
            'SELECT column_default FROM information_schema.columns WHERE table_name=\'members\' AND column_name = $1;', [column]);
        const def = res.rows[0].column_default.match(regexp)[0];

        await this.updateGuild(key, column, def);
        
        return;
    }

    async resetUser (id, column) {
        const regexp = /(?<=\')(.*?)(?=\')/; //eslint-disable-line no-useless-escape
        const res = await this.client.db.pool.query(
            'SELECT column_default FROM information_schema.columns WHERE table_name=\'users\' AND column_name = $1;', [column]);
        const def = res.rows[0].column_default.match(regexp)[0];

        await this.updateGuild(id, column, def);

        return;
    }

    async deleteGuild (id) {
        await this.pool.query('DELETE FROM guilds WHERE guild_id = $1;', [id]);
        await this.pool.query('DELETE FROM members WHERE member_id LIKE $1;', [`${id}%`]);
        return;
    }

    async deleteMember (guild_id, user_id) {
        const key = guild_id + ':' + user_id;
        await this.pool.query('DELETE FROM members WHERE member_id = $1;', [key]);
        return;
    }

    async deleteUser (id) {
        await this.pool.query('DELETE FROM users WHERE user_id = $1;', [id]);
        await this.pool.query('DELETE FROM members WHERE member_id LIKE $1;', [`${id}%`]);
        return;
    }

    async createGuild (id) {
        const res = await this.pool.query('INSERT INTO guilds (guild_id) VALUES ($1) RETURNING *;', [id]);
        return res;
    }

    async createMember (guild_id, user_id) {
        const key = guild_id + ':' + user_id;
        const res = await this.pool.query('INSERT INTO members (member_id) VALUES ($1) RETURNING *;', [key]);
        return res.rows[0];
    }

    async createUser (id) {
        const res = await this.pool.query('INSERT INTO users (user_id) VALUES ($1) RETURNING *;', [id]);
        return res.rows[0];
    }
}

module.exports = Database;