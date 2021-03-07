const { addRole, hasRole, removeRole } = require("./guildMemberHandlers");
const user = require("./db/discordMemberHandlers");

const reactForMember = async (bot, discordUser, add) => {
  if (discordUser.bot === true) return;

  if ((await hasRole(bot, discordUser, "JIITian")) === true) return;

  if (add === true) {
    if ((await hasRole(bot, discordUser, "Member")) === true) return;
    addRole(bot, discordUser, "Member");
    const userObj = await user.existsInUsers(discordUser.id);
    if (userObj === null) {
      await user.add(discordUser.id);
    }
  } else {
    if ((await hasRole(bot, discordUser, "Member")) === true)
      removeRole(bot, discordUser, "Member");
  }
};

const reactionHandler = async (bot, reaction, discordUser, add) => {
  if (reaction.message.channel.id === process.env.RULES_CHANNEL_ID) {
    await reactForMember(bot, discordUser, add);
  }
};

module.exports = reactionHandler;
