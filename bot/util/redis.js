const redis = require('redis')
const generators = require('redis-async-gen')

class Redis {
  constructor(client) {
    // Create redis client
    this.global = redis.createClient(this.client.config.redis)
    this.server = this.global.duplicate({ db: 1 })
    this.member = this.global.duplicate({ db: 2 })
    this.user = this.global.duplicate({ db: 3 })

    // Deletes specified guild entry
    this.deleteGuild = async function (id) {
        this.server.del(id)
        var { keysMatching } = await generators.using(this.member)
        // eslint-disable-next-line no-unused-vars
        for await (const key of keysMatching(id + '-*')) {
            this.member.del(key)
        }
    }

    // Deletes specified user and their member entries in guilds
    this.deleteUser = async function (id) {
        this.user.del(id)
        var { keysMatching } = await generators.using(this.member)
        // eslint-disable-next-line no-unused-vars
        for await (const key of keysMatching('*-' + id)) {
            this.member.del(key)
        }
    }

    // Deletes member of user in specified guild
    this.deleteMember = async function (guildId, id) {
        this.member.del(guildId + '-' + id)
    }
  }
}

module.exports = Redis 