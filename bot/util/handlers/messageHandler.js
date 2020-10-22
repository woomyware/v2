class MessageHandler {
    constructor (client) {
        this.client = client;
    }

    async handle (message) {
        if (message.author.bot) return;

        const prefixes = [];
        const data = {};

        data.user = await this.client.db.getUser(message.author.id);
        prefixes.push(data.user.prefix);

        if (message.channel.guild) {
            if (!message.channel.permissionsOf(this.client.user.id).has('sendMessages')) return;
            data.guild = await this.client.db.getGuild(message.channel.guild.id);
            data.member = await this.client.db.getMember(message.channel.guild.id, message.author.id);
            prefixes.push(data.guild.prefix);

            if (data.guild.blacklist.includes(message.author.id)) return;

            if (message.content === `<@${this.client.user.id}>` || message.content === `<@!${this.client.user.id}>`) {
                return message.channel.createMessage(`Hi! The server prefix is \`${data.guild.prefix}\`, and your personal prefix is \`${data.user.prefix}\`. You can also ping me ^-^`);
            }
        }
        
        if (message.content === `<@${this.client.user.id}>` || message.content === `<@!${this.client.user.id}>`) {
            return message.channel.createMessage(`Hi! Your personal prefix is \`${data.user.prefix}\`. You can also ping me ^-^`);
        }

        prefixes.push(`<@${this.client.user.id}> `, `<@!${this.client.user.id}> `);

        let prefix;

        for (const thisPrefix of prefixes) {
            if (message.content.startsWith(thisPrefix)) {
                prefix = thisPrefix;
                break;
            }
        }

        if (!prefix) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const commandName = args.shift().toLowerCase();
        const command = this.client.commands.get(commandName) || this.client.commands.get(this.client.aliases.get(commandName));
    
        if (!command) return;

        if (message.channel.guild) {
            if (data.guild.disabledcommands.includes(command.name)) return message.channel.createMessage(
                'This command has been disabled by a server administrator.'
            );

            if (data.guild.disabledcategories.includes(command.category)) return message.channel.createMessage(
                'The category this command is apart of has been disabled by a server administrator.'
            );

            const missingUserPerms = this.client.helpers.checkPermissions(message.channel, message.author.id, command.userPerms);
            if (missingUserPerms) return message.channel.createMessage(
                `You can't use this command because you lack these permissions: \`${missingUserPerms.join('`, `')}\``
            );

            const missingBotPerms = this.client.helpers.checkPermissions(message.channel, this.client.user.id, command.botPerms);
            if (missingBotPerms) return message.channel.createMessage(
                `I can't run this command because I lack these permissions: \`${missingBotPerms.join('`, `')}\``
            );
        }

        if (command.enabled === false) return message.channel.createMessage('This command has been disabled by my developers.');
        
        if (command.devOnly === true && this.client.helpers.isDeveloper(message.author.id) !== true) {
            return message.channel.send('This command\'s usage is restricted to developers only. Sorry!');
        } 

        if (command.guildOnly === true && !message.channel.guild) {
            return message.channel.createMessage('This command is unavailable in DM\'s, try running it in a server instead!');
        }

        // Cooldown
        if (this.client.cooldowns.get(command.name).has(message.author.id)) {
            const timestamp = this.client.cooldowns.get(command.name).get(message.author.id);
            const currentTime = Date.now();
            const cooldown = command.cooldown / 1000;
            const timePassed = Math.floor((currentTime - timestamp) / 1000);
            return message.channel.createMessage(
                `⏲️ ${message.author.mention}, you need to wait ${cooldown - timePassed} seconds before using this command again.`
            );
        } else {
            this.client.cooldowns.get(command.name).set(message.author.id, new Date());
            setTimeout(() => {
                this.client.cooldowns.get(command.name).delete(message.author.id);
            }, this.client.commands.get(command.name).cooldown);
        }

        try {
            command.run(this.client, message, args, data);
            this.client.logger.command(`Ran ${command.name}`);
        } catch (error) {
            this.client.logger.error('COMMAND_EXECUTION_ERROR', `${command.name}: ${error}`);
        }
    }
}

module.exports = MessageHandler;