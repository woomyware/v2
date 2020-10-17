/* eslint-disable no-unused-vars */

const { Pool } = require('pg');
const format = require('pg-format');
const { pgCredentials } = require('../../config.json');

class Database {
    constructor (client) {
        this.client = client;
        this.pool = new Pool(pgCredentials);
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
        const res = await this.pool.query('SELECT * FROM guilds WHERE user_id = $1;', [id]);
        return res.rows[0];
    }

    async updateGuild (id, column, newValue) {
        const sql = format('UPDATE guilds SET %I = $1 WHERE guild_id = $2;', column);
        const res = await this.pool.query(sql, [newValue, id]);
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

    async resetGuild (id) {

    }

    async resetMember (guild_id, member_id) {

    }

    async resetUser (id) {

    }

    async deleteGuild (id) {
        await this.pool.query('DELETE FROM guilds WHERE guild_id = $1;', [id]);
        await this.pool.query('DELETE FROM members WHERE member_id LIKE $1;', [`${id}%`]);
    }

    async deleteMember (guild_id, user_id) {
        const key = guild_id + ':' + user_id;
        await this.pool.query('DELETE FROM members WHERE member_id = $1;', [key]);
    }

    async deleteUser (id) {
        await this.pool.query('DELETE FROM users WHERE user_id = $1;', [id]);
        await this.pool.query('DELETE FROM members WHERE member_id LIKE $1;', [`${id}%`]);
    }
}

module.exports = Database;