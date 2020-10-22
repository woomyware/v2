// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

const Eris = (require('eris'));
const CommandLoader = require('./util/commandLoader');
const EventLoader = require('./util/eventLoader');
const EventHandler = require('./util/handlers/eventHandler');
const MessageHandler = require('./util/handlers/messageHandler');
const Helpers = require('./util/helpers');
const Database = require('./util/database');
const Logger = require('./util/logger');
const sentry = require('@sentry/node');
const yaml = require('js-yaml');
const constants = require('./constants');
const config = yaml.safeLoad(require('fs').readFileSync('../botconfig.yml', 'utf8'));
const version = require('../package.json').version;

class WoomyClient extends Eris.Client {
    constructor (token, options) {
        super(token, options);

        // Important information Woomy needs to access
        this.config = config;
        this.path = __dirname;
        this.version = version;

        // Essential modules
        this.constants = constants;
        this.logger = Logger;
        this.db = new Database(this);
        this.helpers = new Helpers(this);
        this.commandLoader = new CommandLoader(this);
        this.eventLoader = new EventLoader(this);
        this.eventHandler = new EventHandler(this);
        this.messageHandler = new MessageHandler(this);

        // Collections to store our successfully loaded events and commands in, as well as cooldowns.
        this.commands = new Eris.Collection();
        this.aliases = new Eris.Collection();
        this.eventModules = new Eris.Collection();
        this.cooldowns = new Eris.Collection();
    }

    // Listen for Eris events and pass needed information to the event handler so we can respond to them.
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
    
    // Recieves information from the per-event listeners, and passes on needed information to the handler
    mainEventListener (wsEvent, param_1, param_2) {
        try {
            this.eventHandler.handle(wsEvent, param_1, param_2);
        } catch (error) {
            this.logger.error('MODULE_LISTENER_ERROR', error);
        }
    }

    // All the repeated code below just tells the main event listener what information needs to be passed to the event handler
    runReadyModules () {
        this.mainEventListener('ready');
    }

    runErrorModules (error) {
        this.mainEventListener('error', error);
    }

    runMessageCreateModules (message) {
        this.messageHandler.handle(message);
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
}

// Initialize our client
const client = new WoomyClient(config.token, { 
    maxShards: 'auto',
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

// Extensions of native javascript types, *not good practice* but they're useful
require('./util/prototypes');

// Load commands, event modules and create listeners for Eris events (ready, errors, messages, etc)
client.commandLoader.loadCommands();
client.eventLoader.loadEventModules();
client.createEventListeners();

// Development mode is set in botconfig.yml, and disables some stuff if enabled. Imagine how messy Sentry would be without this!
if (client.config.devmode === true) {
    try { 
        sentry.init({ dsn: client.config.keys.sentry });
    } catch (err) { 
        client.logger.error('SENTRY_INIT_ERROR', `Sentry failed to initialize: ${err}`); 
    }
} else {
    client.logger.warning('DEVELOPMENT_MODE', 'Running in development mode, some features have been disabled.');
}

// Login to Discord
client.connect();

// Process exception/promise rejection listeners
process.on('uncaughtException', (error) => {
    const errorMsg = error.stack.replace(new RegExp(`${client.path}/`, 'g'), './');
    client.logger.error('UNCAUGHT_EXCEPTION_ERROR', errorMsg);
});

process.on('unhandledRejection', err => {
    client.logger.error('UNHANDLED_PROMISE_ERROR', err.stack);
});