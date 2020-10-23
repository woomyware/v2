const { MessageCollector } = require('eris-collector');
const { inspect, promisify } = require('util');

class Helpers {
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

    highestRole (member) {
        if (member.roles.length === 0) return member.guild.roles.find(r => r.name === '@everyone');

        let highestRole;

        for (const roleID of member.roles) {
            const role = member.guild.roles.get(roleID);
            if (!highestRole || highestRole.position < role.position) highestRole = role;
        }
    
        return highestRole;
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


    intBetween (min, max) {
        return Math.round((Math.random() * (max - min) + min));
    }

    isDeveloper (id) {
        if (this.client.config.ownerIDs.includes(id)) return true;
        return false;
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

    wait () {
        promisify(setTimeout);
    }
}

module.exports = Helpers;