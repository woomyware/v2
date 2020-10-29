module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = true,
        this.aliases = ['reboot'],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 0,
        this.help = {
            description: 'Restarts Woomy.',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) { //eslint-disable-line no-unused-vars
        
    }
};