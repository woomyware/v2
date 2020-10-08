const Command = require("../../base/Command.js");
const Discord = require("discord.js");

class Eval extends Command {
  constructor (client) {
    super(client, {
      description: "Evaluates arbitrary Javascript.",
      usage: "eval <expression>",
      aliases: ["ev"],
      permLevel: "Bot Owner",
      devOnly: true
    });
  }

  async run (message, args, data) { // eslint-disable-line no-unused-vars
    const code = args.join(" ");
    try {
      const evaled = eval(code);
      const clean = await this.client.functions.clean(evaled);
      const MAX_CHARS = 3 + 2 + clean.length + 3;
      if (MAX_CHARS > 2000) {
        message.channel.send({ files: [new Discord.MessageAttachment(Buffer.from(clean), "output.txt")] });
      }
      message.channel.send(`\`\`\`js\n${clean}\n\`\`\``);
    } catch (err) {
      const e = await this.client.functions.clean(err);
      const MAX_CHARS = 1 + 5 + 1 + 3 + e.length + 3;
      console.log(MAX_CHARS);
      if (MAX_CHARS > 2000) {
        return message.channel.send({ files: [new Discord.MessageAttachment(Buffer.from(e), "error.txt")] });
      }
      message.channel.send(`\`ERROR\` \`\`\`xl\n${e}\n\`\`\``);
    }
  }
}

module.exports = Eval;
