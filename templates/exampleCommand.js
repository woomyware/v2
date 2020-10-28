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

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        
    }
};