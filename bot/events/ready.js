module.exports = class {
    constructor (client) {
        this.client = client;
    }

    async run () {
        await this.client.functions.wait(1000);
        this.client.user.setActivity(`BNA | v${this.client.version}`, { type: 'WATCHING' }); // lol
        this.client.logger.ready(`Connected to Discord as ${this.client.user.tag}`);
    }
};
