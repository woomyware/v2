// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

const { Client, Collection } = require('discord.js');
const { CommandHandler, EventHandler } = require('./util/handlers');
const Functions = require('./util/functions');
const Database = require('./util/database');
const logger = require('./util/logger');
const sentry = require('@sentry/node'); // eslint-disable-line no-unused-vars 
const config = require('../config.json');
const pkg = require('../package.json');

class WoomyClient extends Client {
    constructor () {
        super();

        // Important information our bot needs to access
        this.config = config;
        this.path = __dirname;
        this.version = pkg.version;

        // dev mode, disables some features if enabled
        this.dev = false;
        if (this.config.devmode === true) {
            this.dev = true;
            // sentry.init({ dsn: this.config.keys.sentry });
        }

        // Essential modules
        this.logger = logger;
        this.functions = new Functions(this);
        this.db = new Database(this);

        // collections, to store commands, their aliases and their cooldown timers in
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection();

        // Handlers, to load commands and events
        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);
    }
}

async function init() {
    const client = new WoomyClient();

    client.logger.info(`Initializing Woomy v${client.version}`);

    await client.commandHandler.loadAll();
    await client.eventHandler.loadAll();

    if (client.dev === true) {
        client.logger.warn('Development mode is enabled. Some features (such as Sentry) have been disabled.');
        client.login(client.config.devtoken);
    } else {
        client.login(client.config.token);
    }
}

init();

process.on('uncaughtException', (err) => {
    const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
    console.error('Uncaught Exception: ', errorMsg);
    process.exit(1);
});

process.on('unhandledRejection', err => {
    console.error('Uncaught Promise Error: ', err);
});