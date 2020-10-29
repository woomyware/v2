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
            description: '',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    run (client, message, args, data) {
        
    }
};