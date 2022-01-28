const { updateCfHandle } = require("./db/discordMemberHandlers");

const handleSet = (text) => {
  let discordId = text.substring(text.indexOf("<") + 2, text.indexOf(">"));
  if (discordId[0] == "!") discordId = discordId.substring(1); // if nickname is used
  const cfHandle = text.substring(text.indexOf("[") + 1, text.indexOf("]"));
  updateCfHandle(discordId, cfHandle);
};

const handleRemove = (text) => {
  let discordId = text.substring(text.indexOf("<") + 2, text.indexOf(">"));
  if (discordId[0] == "!") discordId = discordId.substring(1); // if nickname is used
  updateCfHandle(discordId, undefined);
};

const tleHandler = (message) => {
  if (message.embeds.length === 0) return;

  const text = message.embeds[0].description;

  if (text.startsWith("Handle for") && text.includes("successfully set to"))
    handleSet(text);
  else if (text.startsWith("Removed handle for")) handleRemove(text);
};

module.exports = tleHandler;
