// Don't modify the name or category variables, they are set automatically by the loaders.
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

    // Main function that is called by the message handler when the command is executed
    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        
    }
};