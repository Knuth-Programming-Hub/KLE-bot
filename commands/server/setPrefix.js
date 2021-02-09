const mongo = require("../../mongo");
const prefixModel = require("../../models/prefix.model");

module.exports = {
  name: "setprefix",
  permission: "*",
  description: "Set command prefix",
  usage: (prefix) => `\`\`\`
${prefix}setprefix

Format:
${prefix}setprefix <command-prefix>
\`\`\``,
  execute: async (message, args, prefix) => {
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
