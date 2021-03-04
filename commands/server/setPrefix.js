const mongo = require("../../mongo");
const prefixModel = require("../../models/prefix.model");
const { hasRole } = require("../../utils/guildMemberHandlers");

module.exports = {
  name: "setprefix",
  permission: "*",
  description: "Set command prefix",
  usage: (prefix) => `\`\`\`
${prefix}setprefix

Format:
${prefix}setprefix <command-prefix>
\`\`\``,
  execute: async (bot, message, args, prefix) => {
    const admin = await hasRole(bot, message.author.id, "Admin");
    if (admin === false) {
      message.reply("you do not have permission to run this command.");
      return;
    }

    if (args.length >= 2) {
      message.channel.send(
        `Wrong format! Use ${prefix}help setprefix to know about usage.`
      );
      return;
    }

    await mongo().then(async (mongoose) => {
      try {
        await prefixModel.findOneAndUpdate(
          { _id: process.env.SERVER_GUILD_ID },
          { prefix: args[0] },
          { upsert: true },
          (err, doc) => {
            message.reply(
              `Command prefix successfully changed to **${args[0]}**`
            );
          }
        );
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
