const redis = require('redis')
const generators = require('redis-async-gen');
const { data } = require('./logger');
const { promisify } = require('util');

class Redis {
	constructor(client) {
		this.client = client;
	}

	init () {
		const conf = this.client.config.redis

		// Create redis client
		this.global = redis.createClient(conf)
		this.guild = this.global.duplicate({ db: 1 })
		this.member = this.global.duplicate({ db: 2 })
		this.user = this.global.duplicate({ db: 3 })

		// Promises
		this.guildGetAsync = promisify(this.guild.hget).bind(this.guild)
		this.memberGetAsync = promisify(this.member.hget).bind(this.member)
		this.userGetASync = promisify(this.user.hget).bind(this.user)

		this.guildGetAllAsync = promisify(this.guild.hgetall).bind(this.guild)
		this.memberGetAllAsync = promisify(this.member.hgetall).bind(this.member)
		this.userGetAllAsync = promisify(this.user.hgetall).bind(this.user)
	};

	async guildGet (id, key) {
		let result = await this.client.db.guildGetAsync(id, key);

		if(result === null) {
			result = this.client.config.defaultGuildData[key]

			if (!result) {
				throw new Error('The key provided is invalid. Please check for typing errors.')
			}
		}

		return result;
	}

	async guildSet (id, key, newValue) {
		const oldValue = this.client.db.guildGetAsync(id, key);

		if (oldValue === newValue) {
			return 'This setting already has that value!'
		};

		if (!this.client.config.defaultGuildData[key]) {
			return 'I couldn\'t find this setting, so it probably doesn\'t exist. Check for typos!'
		};

		if (newValue === this.client.config.defaultGuildData[key]) {
			this.client.db.guildDeleteKey(id, key); // Delete duplicates and use defaults in config file
		} else {
			this.client.db.guild.hset(id, key, newValue);
		};
	};

	async memberGet (id, key) {
		let result = await this.client.db.memberGetAsync(id, key);

		if(result === null) {
			result = this.client.config.defaultMemberData[key]

			if (!result) {
				throw new Error('The key provided is invalid. Please check for typing errors.')
			}
		}

		return result;
	}

	async userGet (id, key) {
		let result = await this.client.db.userGetAsync(id, key);

		if(result === null) {
			result = this.client.config.defaultUserData[key]

			if (!result) {
				throw new Error('The key provided is invalid. Please check for typing errors.')
			}
		}

		return result;
	}

  // Deletes all data associated with a guild
  async guildDelete (id) {
    this.guild.del(id)
    var { keysMatching } = await generators.using(this.member)
    // eslint-disable-next-line no-unused-vars
    for await (const key of keysMatching(id + '-*')) {
      this.member.del(key)
    }
	}
	
	async guildDeleteKey (id, key) {
			this.guild.hdel(id, key)
	}

  // Deletes specified user. If deleteAll, also delete their member entries in guilds
  async userDelete (id, deleteAll) {
		this.user.del(id)
		if (deleteAll) {
			var { keysMatching } = await generators.using(this.member)
			// eslint-disable-next-line no-unused-vars
			for await (const key of keysMatching('*-' + id)) {
				this.member.del(key)
			}
		}
  }

  // Deletes member of user in specified guild
  async memberDelete (guildId, id) {
    this.member.del(guildId + '-' + id)
  }
}

module.exports = Redis;