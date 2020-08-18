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
    permLevel = "User"
  }) {
    this.client = client;
    this.conf = { enabled, guildOnly, devOnly, aliases, permLevel };
    this.help = { name, description, category, usage };
  }
}
module.exports = Command;
