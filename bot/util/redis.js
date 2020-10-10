/* 
 * - All get/set functions will return nothing if the key is not found in the database.
 * - If you want to delete a key, use hdelAsync. Writing extended functions for deleting keys is pointless.
 * - Member key names are formatted as "guildID-userID". Use this.member.del(guildId + '-' + id) to delete member data.
 */

const { promisifyAll } = require('bluebird');
const redis = promisifyAll(require('redis'));
const generators = require('redis-async-gen');

class Redis {
	constructor(client) {
		this.client = client;

		// Create redis client
		this.global = redis.createClient(this.client.config.redis)
		this.guild = this.global.duplicate({ db: 1 })
		this.member = this.global.duplicate({ db: 2 })
		this.user = this.global.duplicate({ db: 3 })

		// Monitor for events emitted by Redis client
		this.global.on('ready', () => {
			this.client.logger.info('Connected to Redis DB.');
		});

		this.global.on('reconnecting', () => {
		this.client.logger.info('Attempting to reconnect to Redis DB...');
		});

		this.global.on('error', (err) => {
			this.client.logger.error('Redis error: ' + err);
		});

		this.global.on('warning', (warn) => {
			this.client.logger.warn('Redis warning: ' + warn);
		});
	}

	async getGuild (id) {
		let result = await this.guild.hgetallAsync(id);
		let defaults = this.client.config.defaultGuildData;

		if (result === null) return defaults;
		
		for (const defaultValue in defaults) {
			if (!result[defaultValue]) {
				result[defaultValue] = defaults[defaultValue];
			};
		};

		return result;
	};

	async getMember (guild, user) {
		let result = await this.member.hgetallAsync(guild + '-' + user);
		let defaults = this.client.config.defaultMemberData;

		if (result === null) return defaults;
		
		for (const defaultValue in defaults) {
			if (!result[defaultValue]) {
				result[defaultValue] = defaults[defaultValue];
			};
		};

		return result;
	};

	async getUser (id) {
		let result = await this.user.hgetallAsync(id);
		let defaults = this.client.config.defaultUserData;

		if (result === null) return defaults;
		
		for (const defaultValue in defaults) {
			if (!result[defaultValue]) {
				result[defaultValue] = defaults[defaultValue];
			};
		};

		return result;
	};

	async getGuildKey (id, key) {
		let result = await this.guild.hgetAsync(id, key);

		// Return value in config if no override is found in the database
		if(result === null) result = this.client.config.defaultGuildData[key];

		return result;
	};

	async getMemberKey (guild, user, key) {
		let result = await this.member.hgetAsync(guild + '-' + user, key);

		if(result === null) result = this.client.config.defaultMemberData[key];

		return result;
	};

	async getUserKey (id, key) {
		let result = await this.user.hgetAsync(id, key);

		if(result === null) result = this.client.config.defaultUserData[key];

		return result;
	};

	async setGuildKey (id, key, newValue) {
		const def = this.client.config.defaultGuildData[key];

		if (!def) return;
		
		if(def === newValue) {
			await this.guild.hdel(id, key); // If new value matches the default, delete the override.
		} else {
			await this.guild.hsetAsync(id, key, newValue);
		};

		return true;
	};

	async setMemberKey (guild, user, key, newValue) {
		const def = this.client.config.defaultMemberData[key];

		if (!def) return;
		
		if(def === newValue) {
			await this.member.hdel(guild + '-' + user, key);
		} else {
			await this.member.hsetAsync(guild + '-' + user, key, newValue);
		};

		return true;
	};

	async setUserKey (id, key, newValue) {
		const def = this.client.config.defaultUserData[key];

		if (!def) return;
		
		if(def === newValue) {
			await this.user.hdel(id, key);
		} else {
			await this.user.hsetAsync(id, key, newValue);
		};

		return true;
	};

  // Deletes all data associated with a guild, INCLUDING MEMBER DATA
  async purgeGuild (id) {
    this.guild.del(id)
    var { keysMatching } = await generators.using(this.member)
    // eslint-disable-next-line no-unused-vars
    for await (const key of keysMatching(id + '-*')) {
      this.member.del(key)
    }
	}

  // Deletes all data associated with a user, INCLUDING MEMBER DATA
  async purgeUser (id) {
		this.user.del(id)
		var { keysMatching } = await generators.using(this.member)
		// eslint-disable-next-line no-unused-vars
		for await (const key of keysMatching('*-' + id)) {
			this.member.del(key)
		}
	}
}

module.exports = Redis;