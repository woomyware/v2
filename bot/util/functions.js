const { inspect, promisify } = require('util');
const colours = require('../assets/colours.json');

class Functions {
    constructor (client) {
        this.client = client;
    }

    async getLastMessage (channel) {
        const messages = await channel.messages.fetch({ limit: 2 });
        return messages.last().content;
    }

    async awaitReply (message, input, limit = 60000) {
        const filter = (m) => m.author.id === message.author.id;
        await message.channel.createMessage(input);

        try {
            const collected = await message.channel.awaitMessages(filter, {
                max: 1,
                time: limit,
                errors: ['time']
            });

            return collected.first().content;
        } catch (err) {
            return false;
        }
    }
    
    intBetween (min, max) {
        return Math.round((Math.random() * (max - min) + min));
    }

    randomColour () {
        const n = (Math.random() * 0xfffff * 1000000).toString(16);
        return '#' + n.slice(0, 6);
    }

    roleObjects (guild, roles) {
        const roleMap = roles.map(roleID => guild.roles.get(roleID));
        return roleMap.sort((a, b) => b.position - a.position);
    }   

    findRole (input, guild) {
        let role;
        role = guild.roles.find(r => r.name.toLowerCase() === input.toLowerCase());
        if (!role) {
            role = guild.roles.get(input.toLowerCase());
        }
        if (!role) return;
        return role;
    }

    highestRole (member) {
        if (member.roles.length === 0) return member.guild.roles.find(r => r.name === '@everyone');

        let highestRole;

        for (const roleID of member.roles) {
            const role = member.guild.roles.get(roleID);
            if (!highestRole || highestRole.position < role.position) highestRole = role;
        }
    
        return highestRole;
    }

    displayHexColour (guild, userID) {
        const roles = this.roleObjects(guild, guild.members.get(userID).roles);
        for (const object of roles) {
            if (object.color !== 0) return '#' + object.color.toString(16);
        }

        const colourKeys = Object.keys(colours);
        return colours[colourKeys[ colours.length * Math.random() << 0]];
    }

    checkPermissions (channel, user_id, requiredPerms) {
        const minimumPerms = ['readMessages', 'sendMessages', 'embedLinks'];
        const pendingPerms = (!requiredPerms) ? minimumPerms : minimumPerms.concat(requiredPerms);
        const missingPerms = [];

        pendingPerms.forEach(p => {
            if (!channel.permissionsOf(user_id).has(p)) missingPerms.push(p);
        });

        if (missingPerms.length > 0) return missingPerms;

        return;
    }

    async getUser (id) {
        if (this.client.users.has(id)) return this.client.users.get(id);
        this.client.logger.debug('REST_FETCH_USER', 'Accessing rest API...');
        const user = await this.client.getRESTUser(id).catch(err => {
            this.client.logger.error('USER_FETCH_ERROR', err);
        });
        
        if (user) {
            this.client.users.set(id, user);
            return user;
        }

        return;
    }
    
    async getGuild (id) {
        if (this.client.guilds.has(id)) return this.client.guilds.get(id);
        this.client.logger.debug('REST_FETCH_GUILD', 'Accessing rest API...');
        const guild = await this.client.getRESTGuild(id).catch(err => {
            this.client.logger.error('GUILD_FETCH_ERROR', err);
        });
        
        if (guild) {
            this.client.guilds.set(id, guild);
            return guild;
        }

        return;
    }

    async clean (text) {
        if (text && text.constructor.name === 'Promise') {
            text = await text;
        }

        if (typeof text !== 'string') {
            text = inspect(text, { depth: 1});
        }

        text = text
            .replace(/`/g, '`' + String.fromCharCode(8203))
            .replace(/@/g, '@' + String.fromCharCode(8203))
            .replace(this.client.token, 'mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0');
    
        return text;
    }

    shutdown () {
        const exitQuotes = [
            'Shutting down.',
            'I don\'t blame you.',
            'I don\'t hate you.',
            'Whyyyyy',
            'Goodnight.',
            'Goodbye'
        ];

        this.client.disconnect();

        this.client.logger.success('SHUTDOWN_SUCCESS', exitQuotes.random());

        process.exit();
    }

    wait () {
        promisify(setTimeout);
    }
}

module.exports = Functions;