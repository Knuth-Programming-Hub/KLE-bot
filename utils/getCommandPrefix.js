const mongo = require("../mongo");
const prefixModel = require("../models/prefix.model");

module.exports = async () => {
  let commandPrefix = "!"; // default prefix

  await mongo().then(async (mongoose) => {
    try {
      await prefixModel.findById(process.env.SERVER_GUILD_ID, (err, doc) => {
        if (doc) commandPrefix = doc.prefix;
      });
    } finally {
      mongoose.connection.close();
    }
  });

  return commandPrefix;
};
