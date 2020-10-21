const read = require('fs-readdir-recursive');

class CommandLoader {
    constructor (client) {
        this.client = client;
        this.commandFiles = read('./commands').filter(file => file.endsWith('.js'));
    }

    // Loads up all commands
    loadCommands () {
        for (const file of this.commandFiles) {
            try {
                const name = file.substr(file.indexOf('/') + 1).slice(0, -3);
                const category = file.substr(0, file.indexOf('/'));
                const command = new (require(this.client.path + '/commands/' + file))(name, category);

                this.client.commands.set(command.name, command);
                this.client.cooldowns.set(command.name, new Map());
                command.aliases.forEach(alias => {
                    this.client.aliases.set(alias, command.name);
                });
            } catch (error) {
                this.client.logger.error('COMMAND_LOADER_ERROR', `Failed to load ${file}: ${error}`);
            }
        }

        this.client.logger.success('COMMAND_LOADER_SUCCESS', `Loaded ${this.client.commands.size}/${this.commandFiles.length} commands.`);
    }

    // Reloads all currently loaded commands, so we don't need to restart to apply changes
    reloadCommands () {
        this.client.cooldowns.clear();
        this.client.commands.forEach(cmd => {
            try {
                delete require.cache[require.resolve(`${this.client.path}/commands/${cmd.category}/${cmd.name}.js`)];
                this.client.commands.delete(cmd.name);
            } catch (error) {
                this.client.logger.error('COMMAND_LOADER_ERROR', `Failed to unload ${cmd}: ${error}`);
            }
        });
        
        this.loadCommands();
    }
}

module.exports = CommandLoader;