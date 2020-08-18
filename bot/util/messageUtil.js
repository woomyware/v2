class MessageUtil {
  constructor (client) {
    this.client = client;
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
}

module.exports = MessageUtil;