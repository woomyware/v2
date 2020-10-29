module.exports = class {
    constructor (wsEvent) {
        this.wsEvent = wsEvent;
    }

    async run (client) {
        client.logger.event(`Logged in as ${client.user.username + '#' + client.user.discriminator} and ready to accept commands! | v${client.version}`);
    }
};