const { hasRole } = require("../../utils/guildMemberHandlers");

module.exports = {
  name: "clearchannel",
  permission: "*",
  description: "Delete all the messages from a channel",
  usage: (prefix) => `\`\`\`
${prefix}clearchannel

Simply type the command to clear the messages of the current channel.
Be very careful when using this command!
\`\`\``,
  execute: async (bot, message, args, prefix) => {
    const admin = await hasRole(bot, message.author.id, "Admin");
    if (admin === false) {
      message.reply("you do not have permission to run this command.");
      return;
    }
    message.channel.messages.fetch().then((res) => {
      message.channel.bulkDelete(res);
    });
  },
};
