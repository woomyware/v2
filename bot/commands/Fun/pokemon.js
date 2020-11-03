const Embed = require('../../util/embed');
const colours = require('../../assets/constants/typeColours.json');
const fetch = require('node-fetch');

module.exports = class {
    constructor (name, category) {
        this.name = name,
        this.category = category,
        this.enabled = true,
        this.devOnly = false,
        this.aliases = ['pokedex', 'dex'],
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

        fetch('https://graphqlpokemon.favware.tech/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: `
                {
                    getPokemonDetails(pokemon: ${query}) {
                        num
                        species
                        types
                        abilities { first second hidden special }
                        baseStats { hp attack defense specialattack specialdefense speed }
                        eggGroups
                        evolutionLevel
                        evolutions { species evolutionLevel evolutions { species evolutionLevel } }
                        preevolutions { species evolutionLevel preevolutions { species evolutionLevel } }
                        gender { male female }
                        height
                        weight
                        otherFormes
                        cosmeticFormes
                        baseStatsTotal
                        flavorTexts { game flavor }
                        sprite
                        shinySprite
                        smogonTier
                        bulbapediaPage
                        serebiiPage
                        smogonPage
                    }
                }
            `})
        })
            .then((res) => res.json())
            .then((json) => {
                const pokemon = json.data.getPokemonDetails;
                const evoChain = this.parseEvoChain(pokemon);
                const genderRatio = this.parseGenderRatio(pokemon.gender);
                const abilities = this.parseAbilities(pokemon.abilities);
                let sprite = pokemon.sprite;
                if (Math.floor((Math.random() * 100) + 1) === 69) sprite = pokemon.shinySprite;
                let formes = '(No Alternate Formes)';
                if (pokemon.otherFormes) {
                    formes = pokemon.otherFormes.join(', ');
                    if (pokemon.cosmeticFormes) {
                        formes = formes.split().concat(pokemon.cosmeticFormes);
                    }
                }
                const embed = new Embed()
                    .setColour(colours[pokemon.types[0]])
                    .setTitle(`${pokemon.species.toProperCase()} (No. ${pokemon.num})`)
                    .setDescription(pokemon.flavorTexts[0].flavor)
                    .setThumbnail(sprite)
                    .addField('**Types:**', pokemon.types.join(', '), true)
                    .addField('**Abilities:**', abilities.join(', '), true)
                    .addField('**Gender Ratio:**', genderRatio, true)
                    .addField('**Base Stats:**', `**HP:** ${pokemon.baseStats.hp} **Atk:** ${pokemon.baseStats.attack} **Def:** ${pokemon.baseStats.defense} **SpA:** ${pokemon.baseStats.specialattack} **SpD:** ${pokemon.baseStats.specialdefense} **Spe:** ${pokemon.baseStats.speed} **BST:** ${pokemon.baseStatsTotal}`)
                    .addField('**Evolution Chain:**', evoChain)
                    .addField('**Other Formes:**', formes)
                    .addField('**Height:**', `${pokemon.height}m`, true)
                    .addField('**Weight:**', `${pokemon.weight}kg`, true)
                    .addField('**Egg Groups:**', pokemon.eggGroups.join(', '), true)
                    .addField('**Smogon Tier:**', pokemon.smogonTier, true)
                    .addField('**External Resources:**', `[Bulbapedia](${pokemon.bulbapediaPage}) | [Serebii](${pokemon.serebiiPage}) | [Smogon](${pokemon.smogonPage})`);
                message.channel.createMessage({ embed: embed });
            })
            .catch(err => console.log(err));
    }

    constructEvoLink (species, level, evoChain, isEvo = true) {
        if (isEvo) {
            return `${evoChain} → \`${species.toProperCase()}\` ${level ? `(${level})` : ''}`;
        }
        return `\`${species.toProperCase()}\` ${level ? `(${level})` : ''} → ${evoChain}`;
    }

    parseEvoChain (pokeDetails) {
        // Set evochain if there are no evolutions
        let evoChain = `**${pokeDetails.species.toProperCase()} ${pokeDetails.evolutionLevel ? `(${pokeDetails.evolutionLevel})` : ''}**`;
        if (!pokeDetails.evolutions && !pokeDetails.preevolutions) {
            evoChain += ' (No Evolutions)';
        }

        // Parse pre-evolutions and add to evochain
        if (pokeDetails.preevolutions) {
            const { evolutionLevel } = pokeDetails.preevolutions[0];
            evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].species, evolutionLevel, evoChain, false);

            // If the direct pre-evolution has another pre-evolution (charizard -> charmeleon -> charmander)
            if (pokeDetails.preevolutions[0].preevolutions) {
                evoChain = this.constructEvoLink(pokeDetails.preevolutions[0].preevolutions[0].species, null, evoChain, false);
            }
        }

        // Parse evolution chain and add to evochain
        if (pokeDetails.evolutions) {
            evoChain = this.constructEvoLink(pokeDetails.evolutions[0].species, pokeDetails.evolutions[0].evolutionLevel, evoChain);

            // In case there are multiple evolutionary paths
            const otherFormeEvos = pokeDetails.evolutions.slice(1);
            if (otherFormeEvos) {
                evoChain = `${evoChain}, ${otherFormeEvos.map((oevo) => `\`${oevo.species}\` (${oevo.evolutionLevel})`).join(', ')}`;
            }

            // If the direct evolution has another evolution (charmander -> charmeleon -> charizard)
            if (pokeDetails.evolutions[0].evolutions) {
                evoChain = this.constructEvoLink(
                    pokeDetails.evolutions[0].evolutions[0].species,
                    pokeDetails.evolutions[0].evolutions[0].evolutionLevel,
                    evoChain
                );
            }
        }

        return evoChain;
    }

    parseGenderRatio (genderRatio) {
        if (genderRatio.male === '0%' && genderRatio.female === '0%') {
            return 'Genderless';
        }

        return `${genderRatio.male} ♂ | ${genderRatio.female} ♀`;
    }

    parseAbilities (abilitiesData) {
        const abilities = [];
        for (const [type, ability] of Object.entries(abilitiesData)) {
            if (!ability) continue;
            abilities.push(type === 'hidden' ? `*${ability}*` : ability);
        }

        return abilities;
    }
};