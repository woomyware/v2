/* eslint-disable indent */

class EventHandler {
    constructor (client) {
        this.client = client;
    }

    handle (wsEvent, param_1, param_2) {
        switch (wsEvent) {
            case 'ready': {
                const readyModules = this.client.eventModules.filter(module => module.wsEvent === 'ready');
                readyModules.forEach(module => module.run(this.client));
                break;
            }

            // param_1 - error message
            case 'error': {
                const errorModules = this.client.eventModules.filter(module => module.wsEvent === 'error');
                errorModules.forEach(module => module.run(this.client, param_1));
                break;
            }

            // param_1 - message object
            case 'messageCreate': {
                const mCreateModules = this.client.eventModules.filter(module => module.wsEvent === 'messageCreate');
                mCreateModules.forEach(module => module.run(this.client, param_1));
                break;
            }

            // param_1 - guild object
            case 'guildCreate': {
                const gCreateModules = this.client.eventModules.filter(module => module.wsEvent === 'guildCreate');
                gCreateModules.forEach(module => module.run(this.client, param_1));
                break;
            }

            // param_1 - guild object
            case 'guildDelete': {
                const gDeleteModules = this.client.eventModules.filter(module => module.wsEvent === 'guildDelete');
                gDeleteModules.forEach(module => module.run(this.client, param_1));
                break;
            }

            // param_1 - guild object | param_2 - member object
            case 'guildMemberAdd': {
                const gMemberAddModules = this.client.eventModules.filter(module => module.wsEvent === 'guildMemberAdd');
                gMemberAddModules.forEach(module => module.run(this.client, param_1, param_2));
                break;
            }

            // param_1 - guild object | param_2 - member object
            case 'guildMemberRemove': {
                const gMemberRemoveModules = this.client.eventModules.filter(module => module.wsEvent === 'guildMemberRemove');
                gMemberRemoveModules.forEach(module => module.run(this.client, param_1, param_2));
                break;
            }

            // param_1 - old voice state | param_2 - new voice state
            case 'voiceStateUpdate': {
                const vStateUpdateModules = this.client.eventModules.filter(module => module.wsEvent === 'voiceStateUpdate');
                vStateUpdateModules.forEach(module => module.run(this.client));
                break;
            }
        }
    }
}

module.exports = EventHandler;