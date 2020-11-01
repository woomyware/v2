const Embed = require('../../util/embed');
const Pokedex = require('pokedex-promise-v2');
const Dex = new Pokedex();

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = [],
        this.userPerms = [],
        this.botPerms = [],
        this.cooldown = 2000,
        this.help = {
            description: '',
            arguments: '',
            details: '',
            examples: ''
        };
    }

    async run (client, message, args, data) { //eslint-disable-line no-unused-vars
        const forms = [
            'mega',
            'alola',
            'alolan',
            'galar',
            'galarian'
        ];
        
        let query = args.join(' ');
        let form = '';
        let spritePrefix = '';

        for (let i = 0; i < forms.length; i++) {
            if (query.indexOf(forms[i]) > -1) {
                query = query.replace(forms[i], '');
                if (forms[i] === '-galarian') {
                    form += 'galar';
                } else if (forms[i] === '-alolan') {
                    form += '-alola';
                } else {
                    form += `-${forms[i]}`;
                }

                if (forms[i] === 'alola') {
                    spritePrefix = 'alolan-';
                } else if (forms[i] === 'galar') {
                    spritePrefix = 'galarian-';
                } else {
                    spritePrefix = `${forms[i]}-`;
                }
                break;
            }
        }

        query = query.trim();

        const pokemon = await Dex.resource('/api/v2/pokemon/' + query + form);
        const pokeSpecies = await Dex.resource('/api/v2/pokemon-species/' + pokemon.species.name);
        let evoData = await Dex.resource(pokeSpecies.evolution_chain.url);

        evoData = evoData.chain;

        const typeArray = [];

        for (let i = 0; i < pokemon.types.length; i++) {
            typeArray.push(pokemon.types[i].type.name.toProperCase());
        }

        const abilityArray = [];

        for (let i = 0; i < pokemon.abilities.length; i++) {
            let ability = pokemon.abilities[i].ability.name.toProperCase();
            if (pokemon.abilities[i].is_hidden === true) ability = `*${ability}*`;
            abilityArray.push(ability);
        }

        const evoArray = [];

        do {
            const numberOfEvolutions = evoData.evolves_to.length;  

            evoArray.push(evoData.species.name.toProperCase());

            if (numberOfEvolutions > 1) {
                for (let i = 1;i < numberOfEvolutions; i++) { 
                    evoArray.push(evoData.species.name.toProperCase());
                }
            }        

            evoData = evoData.evolves_to[0];

        } while (evoData != undefined && evoData.hasOwnProperty('evolves_to')); //eslint-disable-line no-prototype-builtins

        console.log(evoArray)

        const filtered = pokeSpecies.flavor_text_entries.filter(text => text.language.name === 'en');
        const description = filtered[0].flavor_text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g,' ');

        let spritePath = 'normal';
        const random = client.functions.intBetween(0, 100);
        if (random === 69) spritePath = 'shiny';

        console.log(`https://raw.githubusercontent.com/woomyware/rotom-b-data/master/sprites/pokemon/${spritePath}/${spritePrefix}${query}.gif`);

        const embed = new Embed()
            .setTitle(pokemon.name.toProperCase())
            .setThumbnail(`https://raw.githubusercontent.com/woomyware/rotom-b-data/master/sprites/pokemon/${spritePath}/${spritePrefix}${query}.gif`)
            .setDescription(description.replace('\n', ''))
            .addField('**Types:**', typeArray.join(', '), true)
            .addField('**Abilities:**', abilityArray.join(', '), true);
        if (evoArray.length > 1) embed.addField('**Evolution Chain:**', evoArray.join(' → ').replace(pokeSpecies.name.toProperCase(), `**${pokeSpecies.name.toProperCase()}**`));
        embed.addField('**Base Stats:**', `**HP:** ${pokemon.stats[0].base_stat} **Atk:** ${pokemon.stats[1].base_stat} **Def:** ${pokemon.stats[2].base_stat} **SpA:** ${pokemon.stats[3].base_stat} **SpD:** ${pokemon.stats[4].base_stat} **Spe:** ${pokemon.stats[5].base_stat}`);
        message.channel.createMessage({ embed: embed });
    }
};