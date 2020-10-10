class Command {

  constructor (client, {
    name = null,
    description = "No description provided.",
    category = "Miscellaneous",
    usage = "No usage provided.",
    enabled = true,
    guildOnly = false,
    devOnly = false,
    aliases = new Array(),
    permLevel = "User",
    cooldown = 2000
  }) {
    this.client = client;
    this.conf = { enabled, guildOnly, devOnly, aliases, permLevel, cooldown };
    this.help = { name, description, category, usage };
  }
}
module.exports = Command;
