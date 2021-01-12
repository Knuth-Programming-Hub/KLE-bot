const { updateCfHandle } = require("./usersHandlers");
const { getBatch } = require("./guildMemberHandlers");

const handleIdentify = async (bot, message) => {
  if (message.embeds.length === 0) return;

  const text = message.embeds[0].description;
  if (!(text.startsWith("Handle for") && text.includes("successfully set to")))
    return;

  const discordId = text.substring(text.indexOf("<") + 2, text.indexOf(">"));
  const cfHandle = text.substring(text.indexOf("[") + 1, text.indexOf("]"));

  const batch = await getBatch(bot, discordId);
  updateCfHandle(discordId, cfHandle, batch);
};

module.exports = {
  handleIdentify,
};
