module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['disabled'],
        this.userPerms = ['administrator'],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'description',
            arguments: '[command/category]',
            details: '`command/category` - choose whether to disable a command or a category.',
            examples: 'examples'
        };
    }

    async run (client, message, args, data) {
        const essential = {
            categories: ['Configuration', 'Developer'],
            commands: ['help']
        };

        if (!args[0] || args[0].toLowerCase() === 'list') {
            return;
        }

        if (!args[1]) return message.channel.createMessage(
            `${client.config.emojis.userError} You didn't specify what command/category to disable. Usage: \`${this.help.usage}\``
        );

        if (args[0].toLowerCase() === 'command' || args[0].toLowerCase() === 'cmd') {
            const disabled = data.guild.disabledcommands;

            let command;

            if (client.commands.has(args[1])) {
                command = client.commands.get(args[1]);
            } else if (client.aliases.has(args[1])) {
                command = client.commands.get(client.aliases.get(args[1]));
            }

            if (!command) return message.channel.createMessage(
                `${client.config.emojis.userError} ${args[1]} isn't a command or an alias, are you sure you spelt it correctly?`
            );

            if (essential.commands.includes(command.name) || essential.categories.includes(command.category)) {
                return message.channel.createMessage(
                    `${client.config.emojis.userError} This command is essential and cannot be disabled. Sorry!`
                );
            }

            if (disabled.includes(command.name)) return message.channel.createMessage(
                `${client.config.emojis.userError} This command is already disabled.`  
            );

            disabled.push(command.name);

            await client.db.updateGuild(message.channel.guild.id, 'disabledcommands', disabled);

            return message.channel.createMessage(
                `${client.config.emojis.success} Added **${args[1]}** to the list of disabled commands for this server.`
            );
        }

        if (args[0].toLowerCase() === 'category' || args[0].toLowerCase() === 'cat') {
            const disabled = data.guild.disabledcommands;

            let command;

            if (client.commands.has(args[1])) {
                command = client.commands.get(args[1]);
            } else if (client.aliases.has(args[1])) {
                command = client.commands.get(client.aliases.get(args[1]));
            }

            if (!command) return message.channel.createMessage(
                `${client.config.emojis.userError} ${args[1]} isn't a category, are you sure you spelt it correctly?`
            );

            if (!disabled.includes(command.name)) return message.channel.createMessage(
                `${client.config.emojis.userError} This category isn't disabled.`  
            );

            disabled.remove(command.name);

            await client.db.updateGuild(message.channel.guild.id, 'disabledcommands', disabled);
            
            return message.channel.createMessage(
                `${client.config.emojis.success} Added **${args[1]}** to the list of disabled category for this server!`
            );
        }
    }
};