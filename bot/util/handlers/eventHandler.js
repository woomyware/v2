class EventHandler {
    constructor (client) {
        this.client = client;
    }

    ready () {
        const readyModules = this.client.eventModules.filter(module => module.wsEvent = 'ready');
        readyModules.forEach(module => module.execute(this.client));
    }

    error () {
        const errorModules = this.client.eventModules.filter(module => module.wsEvent = 'error');
        errorModules.forEach(module => module.execute(this.client));
    }

    messageCreate () {
        const mCreateModules = this.client.eventModules.filter(module => module.wsEvent = 'messageCreate');
        mCreateModules.forEach(module => module.execute(this.client));
    }

    guildCreate () {
        const gCreateModules = this.client.eventModules.filter(module => module.wsEvent = 'guildCreate');
        gCreateModules.forEach(module => module.execute(this.client));
    }

    guildDelete () {
        const gDeleteModules = this.client.eventModules.filter(module => module.wsEvent = 'guildDelete');
        gDeleteModules.forEach(module => module.execute(this.client));
    }

    guildMemberAdd () {
        const gMemberAddModules = this.client.eventModules.filter(module => module.wsEvent = 'guildMemberAdd');
        gMemberAddModules.forEach(module => module.execute(this.client));
    }

    guildMemberRemove () {
        const gMemberRemoveModules = this.client.eventModules.filter(module => module.wsEvent = 'guildMemberRemove');
        gMemberRemoveModules.forEach(module => module.execute(this.client));
    }

    voiceStateUpdate () {
        const vStateUpdateModules = this.client.eventModules.filter(module => module.wsEvent = 'voiceStateUpdate');
        vStateUpdateModules.forEach(module => module.execute(this.client));
    }
}

module.exports = EventHandler;