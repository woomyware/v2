'use strict'

// TODO IN REDIS DATABASE MODULE: Find a better way to store arrays/objects

const Database = require('../../base/database')

const redis = require('redis')
const { promisify } = require('util')
const generators = require('redis-async-gen')

class RedisDatabase extends Database {
    constructor(client) {
        super(client)
        // Config
        let conf = this.client.config.redis

        // Create redis client
        this.global = redis.createClient(conf)
        this.guild = this.global.duplicate({ db: 1 })
        this.member = this.global.duplicate({ db: 2 })
        this.user = this.global.duplicate({ db: 3 })

        // Async
        this.guildGetAsync = promisify(this.guild.get).bind(this.guild)
        this.memberGetAsync = promisify(this.member.get).bind(this.member)
        this.userGetAsync = promisify(this.user.get).bind(this.user)

        this.guildSetAsync = promisify(this.guild.set).bind(this.guild)
        this.memberSetAsync = promisify(this.member.set).bind(this.member)
        this.userSetAsync = promisify(this.user.set).bind(this.user)

        // Generators
        this.guildGenerators = generators.using(this.guild)
        this.memberGenerators = generators.using(this.member)
        this.userGenerators = generators.using(this.user)
    }

    async userExists(id) {
        for await (const key of this.userGenerators.keysMatching(id + '-*')) {
            return true
        }

        for await (const key of this.memberGenerators.keysMatching('*-' + id + '-*')) {
            return true
        }

        return false
    }

    async memberExists(guildId, id) {
        for await (const key of this.memberGenerators.keysMatching(guildId + '-' + id + '-*')) {
            return true
        }

        return false
    }

    async guildExists(id) {
        for await (const key of this.guildGenerators.keysMatching(id + '-*')) {
            return true
        }

        return false
    }

    async createUser(id) {
        // No need to create users with all the data in Redis
    }

    async createMember(guildId, id) {
        // No need to create members with all the data in Redis
    }

    async createGuild(id) {
        // No need to create guilds with all the data in Redis
    }

    async getUser(id) {
        let db = this

        return new function() {
            this.id = id
            this.db = db

            this.get = async function(key) {
                let result = await this.db.userGetAsync(this.id + '-' + key)

                if(result === null) {
                    return this.db.client.config.defaultUserData[key]
                } else {
                    if(String(result).startsWith('[') || String(result).startsWith('{')) return JSON.parse(result)

                    return result
                }
            }

            this.set = async function(key, value) {
                if(typeof(value) === 'object') value = JSON.stringify(value)

                return await this.db.userSetAsync(this.id + '-' + key, value)
            }

            this.delete = async function() {
                return await this.db.deleteUser(this.id)
            }
        }
    }

    async getMember(guildId, id) {
        let db = this

        return new function() {
            this.guildId = guildId
            this.id = id
            this.db = db

            this.get = async function(key) {
                let result = await this.db.memberGetAsync(this.guildId + '-' + this.id + '-' + key)

                if(result === null) {
                    return this.db.client.config.defaultMemberData[key]
                } else {
                    if(String(result).startsWith('[') || String(result).startsWith('{')) return JSON.parse(result)

                    return result
                }
            }

            this.set = async function(key, value) {
                if(typeof(value) === 'object') value = JSON.stringify(value)

                return await this.db.memberSetAsync(this.guildId + '-' + this.id + '-' + key, value)
            }

            this.delete = async function() {
                return await this.db.deleteMember(this.guildId, this.id)
            }
        }
    }

    async getGuild(id) {
        let db = this

        return new function() {
            this.id = id
            this.db = db

            this.get = async function(key) {
                let result = await this.db.guildGetAsync(this.id + '-' + key)

                if(result === null) {
                    return this.db.client.config.defaultGuildData[key]
                } else {
                    if(String(result).startsWith('[') || String(result).startsWith('{')) return JSON.parse(result)

                    return result
                }
            }

            this.set = async function(key, value) {
                if(typeof(value) === 'object') value = JSON.stringify(value)

                return await this.db.guildSetAsync(this.id + '-' + key, value)
            }

            this.delete = async function() {
                return await this.db.deleteGuild(this.id)
            }
        }
    }

    // Deletes specified guild entry
    async deleteGuild(id) {
        for await (const key of this.guildGenerators.keysMatching(id + '-*')) {
            this.guild.del(key)
        }
    }

    // Deletes specified user and their member entries in guilds
    async deleteUser(id) {
        for await (const key of this.userGenerators.keysMatching(id + '-*')) {
            this.user.del(key)
        }

        for await (const key of this.memberGenerators.keysMatching('*-' + id + '-*')) {
            this.member.del(key)
        }
    }

    // Deletes member of user in specified guild
    async deleteMember(guildId, id) {
        for await (const key of this.memberGenerators.keysMatching(guildId + '-' + id + '-*')) {
            this.member.del(key)
        }
    }
}

module.exports = RedisDatabase