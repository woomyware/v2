module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.guildOnly = false,
        this.devOnly = true,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 0,
        this.help = {
            description: 'Reloads all commands and event modules.',
            usage: 'reload',
            examples: undefined
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        client.commandLoader.reloadCommands();
        client.eventLoader.reloadEventModules();
        message.channel.createMessage('All commands and event modules have been reloaded!');
    }
};