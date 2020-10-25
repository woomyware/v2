module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: 'description',
            usage: 'usage',
            examples: 'examples'
        };
    }

    async run (client, message, [action, ...toDisable], data) {
        const essential = {
            categories: ['Configuration', 'Developer'],
            commands: ['help']
        };

        if (!action || action.toLowerCase() === 'list') {
            return;
        }

        if (!toDisable) return message.channel.createMessage(
            `${client.constants.emojis.userError} You didn't specify what command/category to disable. Usage: \`${this.help.usage}\``
        );

        if (action.toLowerCase() === 'command' || action.toLowerCase() === 'cmd') {
            const disabled = data.guild.disabledcommands;
            const notFound = [];
            const alreadyDisabled = [];
            const cannotDisable = [];

            for (let cmd of toDisable) {
                cmd = cmd.toLowerCase();
                let command;

                if (client.commands.has(cmd)) {
                    command = client.commands.get(cmd);
                } else if (client.aliases.has(cmd)) {
                    command = client.commands.get(client.aliases.get(cmd));
                }
                
                if (!command) {
                    notFound.push(cmd);
                    toDisable.remove(cmd);
                }

                if (essential.commands.includes(command.name) || essential.categories.includes(command.category)) {
                    cannotDisable.push(cmd);
                    toDisable.remove(cmd);
                }

                if (disabled.includes(cmd)) {
                    alreadyDisabled.push(cmd);
                    toDisable.remove(cmd);
                }
            }
            
            if (toDisable.length > 0) {
                const push = disabled.concat(toDisable);
                await client.db.updateGuild(message.channel.guild.id, 'disabledcommands', push);
                
            }
            
        }
    }
}