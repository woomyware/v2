class MessageHandler {
    constructor (client) {
        this.client = client;
    }

    async handle (message) {
        // Ignore messages from bots, and messages in DM's
        if (message.author.bot) return;
        if (!message.channel.guild) return;

        // Request all the data we need from the database
        const data = {};
        data.user = await this.client.db.getUser(message.author.id);
        data.guild = await this.client.db.getGuild(message.channel.guild.id);
        data.member = await this.client.db.getMember(message.channel.guild.id, message.author.id);
        
        // Ignore users on the guild blocklist
        if (data.guild.blocklist.includes(message.author.id)) return;

        // If a user pings Woomy, respond to them with the prefixes they can use
        if (message.content === `<@${this.client.user.id}>` || message.content === `<@!${this.client.user.id}>`) {
            return message.channel.createMessage(
                `Hi! Your personal prefix is \`${data.user.prefix}\`. You can also ping me ^-^`
            );
        }

        // All the prefixes Woomy will respond to
        const prefixes = [
            data.user.prefix,
            data.guild.prefix,
            `<@${this.client.user.id}> `,
            `<@!${this.client.user.id}> `
        ];

        let prefix;

        // Check the message content to see if it starts with one of our prefixes
        for (const thisPrefix of prefixes) {
            if (message.content.startsWith(thisPrefix)) {
                prefix = thisPrefix;
                break;
            }
        }

        // Ignore the message if it doesn't start with a valid prefix
        if (!prefix) return;

        // Turn the message content into an array (excluding the prefix)
        const args = message.content.slice(prefix.length).trim().split(/ +/g);

        // Find the command
        const commandName = args.shift().toLowerCase();
        const command = this.client.commands.get(commandName) || this.client.commands.get(this.client.aliases.get(commandName));
    
        // Return if a command (or its aliases) are not found
        if (!command) return;

        // Both of these blocks check if the command is disabled/in a disabled category
        if (data.guild.disabledcommands.includes(command.name)) return message.channel.createMessage(
            this.client.constants.emojis.permError + ' This command has been disabled by a server administrator.'
        );

        if (data.guild.disabledcategories.includes(command.category)) return message.channel.createMessage(
            this.client.constants.emojis.permError + ' The category this command is apart of has been disabled by a server administrator.'
        );

        // Both of these blocks check the permissions of the user, and reply with missing perms if any are found
        const missingUserPerms = this.client.helpers.checkPermissions(message.channel, message.author.id, command.userPerms);
        if (missingUserPerms) return message.channel.createMessage(
            `${this.client.constants.emojis.permError} You can't use this command because you lack these permissions: \`${missingUserPerms.join('`, `')}\``
        );

        const missingBotPerms = this.client.helpers.checkPermissions(message.channel, this.client.user.id, command.botPerms);
        if (missingBotPerms) return message.channel.createMessage(
            `${this.client.constants.emojis.permError} I can't run this command because I lack these permissions: \`${missingBotPerms.join('`, `')}\``
        );

        // Return if the command is disabled globally
        if (command.enabled === false) return message.channel.createMessage(
            this.client.constants.emojis.permError + ' This command has been disabled by my developers.'
        );
        
        // Return if the command is restricted to developers (and the user is not a developer)
        if (command.devOnly === true && this.client.helpers.isDeveloper(message.author.id) !== true) {
            return message.channel.send(
                this.client.constants.emojis.permError + ' This command\'s usage is restricted to developers only. Sorry!'
            );
        } 

        // Cooldown
        if (this.client.cooldowns.get(command.name).has(message.author.id)) {
            const timestamp = this.client.cooldowns.get(command.name).get(message.author.id);
            const currentTime = Date.now();
            const cooldown = command.cooldown / 1000;
            const timePassed = Math.floor((currentTime - timestamp) / 1000);
            return message.channel.createMessage(
                `${this.client.constants.emojis.wait} ${message.author.mention}, you need to wait ${cooldown - timePassed} seconds before using this command again.`
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