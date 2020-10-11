class Command {

  constructor (client, {
    name = null,
    description = "No description provided.",
    category = "Miscellaneous",
    usage = "No usage provided.",
    examples = "",
    enabled = true,
    guildOnly = false,
    devOnly = false,
    aliases = new Array(),
    userPerms = new Array(),
    botPerms = new Array (),
    cooldown = 2000
  }) {
    this.client = client;
    this.conf = { enabled, guildOnly, devOnly, aliases, userPerms, botPerms, cooldown };
    this.help = { name, description, category, usage, examples };
  }
}
module.exports = Command;
