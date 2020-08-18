const discord = require("discord.js");
const config = require("../config.json");

const manager = new discord.ShardingManager("./index.js", {
  totalShards: "auto",
  token: config.token
});

manager.on("shardCreate", (shard) => {
  console.log("Shard " + shard.id + " launched");
});

manager.spawn();