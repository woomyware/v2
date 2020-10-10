const { MessageEmbed } = require('discord.js')

class Functions {
  constructor (client) {
    this.client = client;
  }

  userError (channel, cmd, error) {
    const embed = new MessageEmbed()
    embed.setColor('#EF5350')
    embed.setTitle(cmd.help.name + ':' + cmd.help.category.toLowerCase())
    embed.setDescription(error)
    embed.addField('**Usage**', cmd.help.usage)
    embed.setFooter(`Run 'help ${cmd.help.name}' for more information.`)
    channel.send(embed).then(msg => {
      msg.delete({ timeout: 60000 })
    })
  }

  // Simple check to see if someone is a developer or not
  isDeveloper (userID) {
    if (this.client.config.ownerIDs.includes(userID)) {
      return true;
    };
    return false;
  };

  // Cleans output and removes sensitive information, used by eval
  async clean (text) {
    if (text && text.constructor.name == "Promise")
      text = await text;
    if (typeof text !== "string")
      text = require("util").inspect(text, { depth: 1 });

    text = text
      .replace(/`/g, "`" + String.fromCharCode(8203))
      .replace(/@/g, "@" + String.fromCharCode(8203))
      .replace(this.client.token, "mfa.VkO_2G4Qv3T--NO--lWetW_tjND--TOKEN--QFTm6YGtzq9PH--4U--tG0");

    return text;
  }

  // Return random integer between two given integers
  intBetween (min, max) {
    return Math.round((Math.random() * (max - min))+min);
  }

  // Grab the last message sent in a channel (excludes the command)
  async getLastMessage (channel) {
    if (channel) {
      let lastMsg;

      await channel.messages.fetch({ limit: 2 }).then(messages => {
        lastMsg = messages.last().content;
      });
      return lastMsg;
    }
  }

  // Wait for a reply to a message, then pass through the response
  async awaitReply (msg, question, limit = 60000) {
    const filter = m => m.author.id === msg.author.id;
    await msg.channel.send(question);
    try {
      const collected = await msg.channel.awaitMessages(filter, {
        max: 1,
        time: limit,
        errors: ["time"]
      });
      return collected.first().content;
    } catch (e) {
      return false;
    }
  }

  searchForMembers (guild, query) {
    if (!query) return;
    query = query.toLowerCase();

    var matches = [];
    var match;

    try {
      match = guild.members.cache.find(x => x.displayName.toLowerCase() == query);
      if (!match) guild.members.cache.find(x => x.user.username.toLowerCase() == query);
    } catch (err) {};
    if (match) matches.push(match);
    guild.members.cache.forEach(member => {
      if (
        (member.displayName.toLowerCase().startsWith(query) ||
          member.user.tag.toLowerCase().startsWith(query)) &&
        member.id != (match && match.id)
      ) {
        matches.push(member);
      };
    });
    return matches;
  };

  findRole (input, message) {
    var role;
    role = message.guild.roles.cache.find(r => r.name.toLowerCase() === input.toLowerCase());
    if(!role) {
      role = message.guild.roles.cache.get(input.toLowerCase());
    };
    if(!role) return;
    return role;
  };

  wait () {
    require("util").promisify(setTimeout);
  }
}

module.exports = Functions;