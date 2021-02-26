const fetch = require('node-fetch');
const exitQuotes = require('../../assets/exitQuotes.json');

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
        client.logger.success('RESTART', 'Restart command recieved. ' + exitQuotes.random());
        client.disconnect();
        client.functions.wait();
        
        fetch('https://gamecp.apex.to/api/client/servers/1fc76afa-9a4d-497b-983a-a898795ab5b5/power', {
            method: 'post',
            body: JSON.stringify({ 'signal': 'restart' }),
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${client.config.server}`, 'User-Agent': client.config.userAgent }
        });
    }
};