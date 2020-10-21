const { inspect, promisify } = require('util');

class Helpers {
    constructor (client) {
        this.client = client;
    }

    /* Rewrite for Eris
    userError (channel, cmd, error) {
        const embed = new MessageEmbed()
            .setColor('#EF5350')
            .setTitle(`${cmd.help.name}:${cmd.help.category.toLowerCase()}`)
            .setDescription(error)
            .addField('**Usage**', cmd.help.usage)
            .setFooter(`Run 'help ${cmd.help.name}' for more information.`);

        channel.send(embed);
    }
    */

    async getLastMessage (channel) {
        const messages = await channel.messages.fetch({ limit: 2 });
        return messages.last().content;
    }

    async awaitReply (message, question, limit = 60000) {
        const filter = (m) => m.author.id === message.author.id;
        await message.channel.send(question);

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

    searchForMembers (guild, query) {
        query = query.toLowerCase();

        const matches = [];
        let match;

        try {
            match = guild.members.cache.find(x => x.displayName.toLowerCase() == query);
            if (!match) guild.members.cache.find(x => x.user.username.toLowerCase() == query);
        } catch (err) {} //eslint-disable-line no-empty

        if (match) matches.push(match);
        guild.members.cache.forEach(member => {
            if (
                (member.displayName.toLowerCase().startsWith(query) ||
                member.user.tag.toLowerCase().startsWith(query)) &&
                member.id != (match && match.id)
            ) {
                matches.push(member);
            }
        });

        return matches;
    }

    findRole (input, message) {
        let role;
        role = message.guild.roles.cache.find(r => r.name.toLowerCase() === input.toLowerCase());
        if (!role) {
            role = message.guild.roles.cache.get(input.toLowerCase());
        }
        if (!role) return;
        return role;
    }

    checkPermissions (command, message) {
        const missingPerms = [];

        if (message.member.bot) {
            command.botPerms.forEach(p => {
                if (!message.channel.permissionsOf(this.client.user.id).has(p)) missingPerms.push(p);
            });
        } else {
            command.userPerms.forEach(p => {
                if (!message.channel.permissionsOf(message.author.id).has(p)) missingPerms.push(p);
            });
        }

        if (missingPerms.length > 0) return missingPerms;
    }


    intBetween (min, max) {
        return Math.round((Math.random() * (max - min) + min));
    }

    isDeveloper (id) {
        if (this.client.config.ownerIDs.includes(id)) {
            return true;
        } else {
            return false;
        }
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

        this.client.db.pool.end().then(() => {
            this.client.logger.info('Connection to database closed.');
        });

        this.client.destroy();

        console.log(exitQuotes);
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