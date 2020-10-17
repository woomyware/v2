// The MESSAGE event runs anytime a message is received
// Note that due to the binding of client to every event, every event
// goes `client, other, args` when this function is run.

module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run (message) {
        if (message.author.bot) return;

        const data = {};
        data.user = await this.client.db.getUser(message.author.id);

        const prefixes = [data.user.prefix];

        if (message.guild) {
            data.guild = await this.client.db.getGuild(message.guild.id);
            // data.member = await this.client.db.getMember(message.guild.id, message.author.id);
            prefixes.push(data.guild.prefix);
        }

        prefixes.push(`<@${this.client.user.id}> `, `<@!${this.client.user.id}> `);

        let prefix;

        for (const thisPrefix of prefixes) {
            if (message.content.startsWith(thisPrefix)) prefix = thisPrefix;
        }

        if (message.content.indexOf(prefix) !== 0) return;

        if (prefix === `<@${this.client.user.id}> ` || prefix === `<@!${this.client.user.id}> `) {
            message.prefix = '@Woomy ';
        } else {
            message.prefix = prefix;
        }
        
        // Naughty users can't run commands!
        /* TO-DO: CREATE BLACKLIST */

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        // Cache uncached members
        if (message.guild && !message.member) await message.guild.fetchMember(message.author);

        const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));
        if (!cmd) return;

        if (message.guild) {
            if (!message.channel.permissionsFor(this.client.user).has('SEND_MESSAGES')) {
                try {
                    return message.author.send(`I don't have permission to speak in \`#${message.channel.name}\`, Please ask a moderator to give me the send messages permission!`);
                } catch (err) {} //eslint-disable-line no-empty
            }

        /* NEED A WAY TO STORE ARRAYS IN A HASH
        if (data.guild.disabledCommands.includes(cmd.help.name)) {
            if (data.guild.systemNotice.enabled === true) {
            return message.channel.send('This command has been disabled in this server.');
            };
        };
        
        if (data.guild.disabledCategories.includes(cmd.help.category)) {
            if (data.guild.systemNotice.enabled === true) {
            return message.channel.send('The category this command is apart of has been disabled in this server.');
            };
        };
        */
        }

        if (cmd && cmd.conf.enabled === false) {
            return message.channel.send('This command has been disabled by my developers.');
        }

        if (cmd && cmd.conf.devOnly && this.client.functions.isDeveloper(message.author.id) !== true) {
            return message.channel.send('devs only!');
        }

        if (cmd && !message.guild && cmd.conf.guildOnly === true) {
            return message.channel.send('This command is unavailable via private message. Please run this command in a guild.');
        }

        // Permission handler, for both Woomy and the user
        if (message.guild) {
        // User
            let missingUserPerms = new Array();

            cmd.conf.userPerms.forEach((p) => {
                if (!message.channel.permissionsFor(message.member).has(p)) missingUserPerms.push(p);
            });

            if (missingUserPerms.length > 0) {
                missingUserPerms = '`' + (missingUserPerms.join('`, `')) + '`';
                return message.channel.send(`You don't have sufficient permissions to run this command! Missing: ${missingUserPerms}`);
            }

            // Bot
            let missingBotPerms = [];

            cmd.conf.botPerms.forEach((p) => {
                if (!message.channel.permissionsFor(message.guild.member(this.client.user)).has(p)) missingBotPerms.push(p);
            });

            if (missingBotPerms.length > 0) {
                missingBotPerms = '`' + (missingBotPerms.join('`, `')) + '`';
                return message.channel.send(`I can't run this command because I'm missing these permissions: ${missingBotPerms}`);
            }
        }

        // Cooldown
        if (this.client.cooldowns.get(cmd.help.name).has(message.author.id)) {
            const init = this.client.cooldowns.get(command).get(message.author.id);
            const curr = new Date();
            const diff = Math.round((curr - init) / 1000);
            const time = cmd.conf.cooldown / 1000;
            return message.reply(`this command is on cooldown! You'll be able to use it again in ${time - diff} seconds.`);
        } else {
            this.client.cooldowns.get(cmd.help.name).set(message.author.id, new Date());

            setTimeout(() => {
                this.client.cooldowns.get(cmd.help.name).delete(message.author.id);
            }, this.client.commands.get(cmd.help.name).conf.cooldown);
        }

        message.flags = [];
        while (args[0] &&args[0][0] === '-') {
            message.flags.push(args.shift().slice(1));
        }

        cmd.run(message, args);
        this.client.logger.cmd(`Command ran: ${message.content}`);

        // TODO: Command caching if it's worth it
    }
};
