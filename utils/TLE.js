const { updateCfHandle } = require("./db/discordMemberHandlers");

const handleIdentify = async (message) => {
  if (message.embeds.length === 0) return;

  const text = message.embeds[0].description;
  if (!(text.startsWith("Handle for") && text.includes("successfully set to")))
    return;

  const discordId = text.substring(text.indexOf("<") + 2, text.indexOf(">"));
  const cfHandle = text.substring(text.indexOf("[") + 1, text.indexOf("]"));

  updateCfHandle(discordId, cfHandle);
};

module.exports = {
  handleIdentify,
};
