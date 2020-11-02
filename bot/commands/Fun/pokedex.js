const Embed = require('../../util/embed');
const API = new (require('../../util/pokeapi'));

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

        
        let query = args.join(' ');
        query = query.trim();

        const pokemon = await API.fetchPokemon(args.join(' '));

        const typeArray = [];

        for (let i = 0; i < pokemon.info.types.length; i++) {
            typeArray.push(pokemon.info.types[i].type.name.toProperCase());
        }

        const abilityArray = [];

        for (let i = 0; i < pokemon.info.abilities.length; i++) {
            let ability = pokemon.info.abilities[i].ability.name.toProperCase();
            if (pokemon.info.abilities[i].is_hidden === true) ability = `*${ability}*`;
            abilityArray.push(ability);
        }

        const evoArray = [];
        
        do {
            const numberOfEvolutions = pokemon.evolutions.chain.evolves_to.length;  

            evoArray.push(pokemon.evolutions.chain.species.name.toProperCase());

            if (numberOfEvolutions > 1) {
                for (let i = 1;i < numberOfEvolutions; i++) { 
                    evoArray.push(pokemon.evolutions.chain.species.name.toProperCase());
                }
            }        

            pokemon.evolutions.chain = pokemon.evolutions.chain.evolves_to[0];

        } while (pokemon.evolutions.chain != undefined && pokemon.evolutions.chain.hasOwnProperty('evolves_to')); //eslint-disable-line no-prototype-builtins


        const filtered = pokemon.species.flavor_text_entries.filter(text => text.language.name === 'en');
        const description = filtered[0].flavor_text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g,' ');
        const sprite = API.fetchSprite(query);


        const embed = new Embed()
            .setTitle(pokemon.info.name.toProperCase())
            .setThumbnail(sprite)
            .setDescription(description.replace('\n', ''))
            .addField('**Types:**', typeArray.join(', '), true)
            .addField('**Abilities:**', abilityArray.join(', '), true);
        if (evoArray.length > 1) embed.addField('**Evolution Chain:**', evoArray.join(' → ').replace(pokemon.species.name.toProperCase(), `**${pokemon.species.name.toProperCase()}**`));
        embed.addField('**Base Stats:**', `**HP:** ${pokemon.info.stats[0].base_stat} **Atk:** ${pokemon.info.stats[1].base_stat} **Def:** ${pokemon.info.stats[2].base_stat} **SpA:** ${pokemon.info.stats[3].base_stat} **SpD:** ${pokemon.info.stats[4].base_stat} **Spe:** ${pokemon.info.stats[5].base_stat}`);
        message.channel.createMessage({ embed: embed });
    }
};