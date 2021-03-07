const mongo = require("../../mongo");
const prefixModel = require("../../models/prefix.model");

module.exports = async () => {
  let commandPrefix = "!"; // default prefix

  const mongoose = await mongo();
  await prefixModel.findById(process.env.SERVER_GUILD_ID, (err, doc) => {
    if (doc != null) commandPrefix = doc.prefix;
  });
  await mongoose.connection.close();

  return commandPrefix;
};
