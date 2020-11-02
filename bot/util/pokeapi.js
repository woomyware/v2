const fetch = require('node-fetch');
const { Collection } = require('eris');

class PokeAPI {
    constructor (client) {
        this.client = client;
        this.cache = new Collection();
        this.url = 'https://pokeapi.co/api/v2';
        this.forms = [
            'mega',
            'alola',
            'alolan',
            'galar',
            'galarian'
        ];
    }

    async fetchPokemon (query) {
        let form = '';

        for (let i = 0; i < this.forms.length; i++) {
            if (query.indexOf( this.forms[i]) > -1) {
                query = query.replace( this.forms[i], '');
                if ( this.forms[i] === '-galarian') {
                    form += 'galar';
                } else if ( this.forms[i] === '-alolan') {
                    form += '-alola';
                } else {
                    form += `-${ this.forms[i]}`;
                }
                break;
            }
        }

        query = query.trim();

        if (this.cache.has(query + form)) return this.cache.get(query + form);

        const pokeData = {};

        const info = await fetch(this.url + '/pokemon/' + query + form);
        pokeData.info = await info.json();
        const species = await fetch(this.url + '/pokemon-species/' + pokeData.info.species.name);
        pokeData.species = await species.json();
        const evolutions = await fetch(pokeData.species.evolution_chain.url);
        pokeData.evolutions = await evolutions.json();

        this.cache.set(query + form, pokeData);
        return pokeData;
    }

    fetchSprite (query) {
        let spritePrefix = '';

        for (let i = 0; i < this.forms.length; i++) {
            if (query.indexOf( this.forms[i]) > -1) {
                query = query.replace( this.forms[i], '');
                if ( this.forms[i] === 'alola') {
                    spritePrefix = 'alolan-';
                } else if ( this.forms[i] === 'galar') {
                    spritePrefix = 'galarian-';
                } else {
                    spritePrefix = `${ this.forms[i]}-`;
                }
                break;
            }
        }
        
        let spritePath = 'normal';
        if (Math.floor((Math.random() * 100) + 1) === 69) spritePath = 'shiny';

        return `https://raw.githubusercontent.com/woomyware/rotom-b-data/master/sprites/pokemon/${spritePath}/${spritePrefix}${query}.gif`;
    }
}

module.exports = PokeAPI;