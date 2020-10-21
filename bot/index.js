// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

const Eris = require('eris-additions')(require('eris'));
const EventHandler = require('./util/handlers/eventHandler');
// const messageHandler = require('./util/handlers/messageHandler');
const Helpers = require('./util/helpers');
const Database = require('./util/database');
const Logger = require('./util/logger');
const sentry = require('@sentry/node');
const fs = require('fs');
const read = require('fs-readdir-recursive');
const yaml = require('js-yaml');
const config = yaml.safeLoad(fs.readFileSync('../botconfig.yml', 'utf8'));
const version = require('../package.json').version;

class WoomyClient extends Eris.Client {
    constructor (token, options) {
        super(token, options);

        // Important information Woomy needs to access
        this.config = config;
        this.path = __dirname;
        this.version = version;

        // Load up our command/event modules 
        this.commandFiles = read('./commands').filter(file => file.endsWith('.js'));
        this.eventFiles = read('./event_modules').filter(file => file.endsWith('.js'));

        // Essential modules
        this.logger = Logger;
        this.db = new Database(this);
        this.helpers = new Helpers(this);
        this.eventHandler = new EventHandler(this);
        // this.messageHandler = new messageHandler(this);

        // Collections to store our successfully loaded commands and events in.
        this.commands = new Eris.Collection();
        this.aliases = new Eris.Collection();
        this.cooldowns = new Eris.Collection();
        this.eventModules = new Eris.Collection();
    }

    loadCommands () {
        for (const file of this.commandFiles) {
            try {
                const name = file.substr(file.indexOf('/') + 1).slice(0, -3);
                const category = file.substr(0, file.indexOf('/'));
                const command = new (require(this.path + '/commands/' + file))(name, category);

                this.commands.set(command.name, command);
                this.cooldowns.set(command.name, new Map());
                command.aliases.forEach(alias => {
                    this.aliases.set(alias, command.name);
                });
            } catch (error) {
                this.logger.error('COMMAND_LOADER_ERROR', `Failed to load ${file}: ${error}`);
            }
        }

        this.logger.success('COMMAND_LOADER_SUCCESS', `Loaded ${this.commands.size}/${this.commandFiles.length} commands.`);
    }

    reloadCommands () {
        for (const cmd of this.commands) {
            try {
                
            } catch (error) {

            }
        }
    }

    loadEventModules () {
        for (const file of this.eventFiles) {
            try {
                const name = file.substr(file.indexOf('/') + 1).slice(0, -3);
                const category = file.substr(0, file.indexOf('/'));
                const event = new (require(this.path + '/event_modules/' + file))(category);
                this.eventModules.set(name, event);
            } catch (error) {
                this.logger.error('EVENT_LOADER_ERROR', `Failed to load ${file}: ${error}`);
            }
        }
        this.logger.success('EVENT_LOADER_SUCCESS', `Loaded ${this.eventModules.size}/${this.eventFiles.length} event modules.`);
    }

    reloadEventModules () {
        for (const file of this.eventFiles) {
            try {
                
            } catch (error) {

            }
        }
    }

    mainEventListener (wsEvent, param_1, param_2) {
        try {
            this.eventHandler.handle(wsEvent, param_1, param_2);
        } catch (error) {
            this.logger.error('MODULE_LISTENER_ERROR', error);
        }
    }

    runReadyModules () {
        this.mainEventListener('ready');
    }

    runErrorModules (error) {
        this.mainEventListener('error', error);
    }

    runMessageCreateModules (message) {
        this.mainEventListener('messageCreate', message);
    }

    runGuildCreateModules (guild) {
        this.mainEventListener('guildCreate', guild);
    }

    runGuildDeleteModules (guild) {
        this.mainEventListener('guildDelete', guild);
    }

    runGuildMemberAddModules (guild, member) {
        this.mainEventListener('guildMemberAdd', guild, member);
    }

    runGuildMemberRemoveModules (guild, member) {
        this.mainEventListener('guildMemberRemove', guild, member);
    }

    runVoiceStateUpdateModules (oldState, newState) {
        this.mainEventListener('voiceStateUpdate', oldState, newState);
    }

    createEventListeners () {
        this.on('ready', this.runReadyModules);
        this.on('error', this.runErrorModules);
        this.on('messageCreate', this.runMessageCreateModules);
        this.on('guildCreate', this.runGuildCreateModules);
        this.on('guildDelete', this.runGuildDeleteModules);
        this.on('guildMemberAdd', this.runGuildMemberAddModules);
        this.on('guildMemberRemove', this.runGuildMemberRemoveModules);
        this.on('voiceStateUpdate', this.runVoiceStateUpdateModules);
    }
}

const client = new WoomyClient(config.token, { 
    maxShards: 'auto',
    defaultImageFormat: 'png',
    defaultImageSize: 2048,
    intents: [
        'guilds',
        'guildMembers',
        'guildEmojis',
        'guildVoiceStates',
        'guildMessages',
        'guildMessageReactions',
        'directMessages',
        'directMessageReactions'
    ]
});

require('./util/prototypes');

client.loadCommands();
client.loadEventModules();
client.createEventListeners();

if (client.config.devmode === true) {
    try { 
        // sentry.init({ dsn: client.config.keys.sentry });
    } catch (err) { 
        client.logger.error('SENTRY_INIT_ERROR', `Sentry failed to initialize: ${err}`); 
    }
} else {
    client.logger.warning('DEVELOPMENT_MODE', 'Running in development mode, some features have been disabled.');
}

client.connect();

// Process exception/promise rejection listeners

process.on('uncaughtException', (error) => {
    const errorMsg = error.stack.replace(new RegExp(`${client.path}/`, 'g'), './');
    client.logger.error('UNCAUGHT_EXCEPTION_ERROR', errorMsg);
});

process.on('unhandledRejection', err => {
    client.logger.error('UNHANDLED_PROMISE_ERROR', err);
});