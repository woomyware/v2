// Copyright 2020 Emily J. / mudkipscience and contributors. Subject to the AGPLv3 license.

import { Client, Collection } from 'discord.js';
import sentry from '@sentry/node';
import logger from './util/logger';
import functions from './util/functions';
import database from './util/database';
import { CommandHandler, EventHandler } from './util/handlers';


const config: any = require('../config.json');
const pkg: any = require('../package.json');

class WoomyClient extends Client {

    public config: any;
    public path: string;
    public dev: boolean;
    public version: string;
    public logger: any;
    public functions: any;
    public db: any;
    public commands: any;
    public aliases: any;
    public cooldowns: any;
    public commandHandler: any;
    public eventHandler: any;

    public constructor () {
        super();

        // Important information our bot needs to access
        this.config = config;
        this.path = __dirname;
        this.version = pkg.version;

        // dev mode, disables some features if enabled
        this.dev = false;
        if (this.config.devmode === true) {
            this.dev = true;
            sentry.init({ dsn: this.config.kets.sentry });
        };

        // Essential modules
        this.logger = logger;
        this.functions = new functions(this);
        this.db = new database(this);

        // collections, to store commands, their aliases and their cooldown timers in
        this.commands = new Collection();
        this.aliases = new Collection();
        this.cooldowns = new Collection;

        // Handlers, to load commands and events
        this.commandHandler = new CommandHandler(this);
        this.eventHandler = new EventHandler(this);
    };  
};

async function init(): Promise<void> {
    const client = new WoomyClient();

    client.logger.info(`Initializing Woomy v${client.version}`);

    await client.commandHandler.loadAll();
    await client.eventHandler.loadAll();

    if (client.dev === true) {
        client.logger.warn('Development mode is enabled. Some features (such as Sentry) have been disabled.');
        client.login(client.config.devtoken);
    } else {
        client.login(client.config.token);
    };
};

init();

process.on('uncaughtException', (err) => {
	const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, 'g'), './');
	console.error('Uncaught Exception: ', errorMsg);
	process.exit(1);
});

process.on('unhandledRejection', err => {
	console.error('Uncaught Promise Error: ', err);
});