const axios = require("axios");
const { existsInUsers } = require("../../utils/db/discordMemberHandlers");

const parentName = "cfgroup";
const name = "getinvite";

module.exports = {
  parentName,
  name,
  description: "Get the invitation to join the KPH Codeforces group!",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the invitation for the CF group.
Note: 
- JIITian role is needed to get the invite.
- You must link your Dicord ID to your CF handle.
\`\`\``,
  execute: async (bot, message, args, prefix) => {
    const userObj = await existsInUsers(message.author.id);
    if (userObj === null || userObj.cfHandle === undefined) {
      message.reply(
        'Unable to find the CF handle. Make sure you have "identified" your handle.'
      );
      return;
    }

    if (userObj.batch === undefined) {
      message.reply("This command is only available for JIITians.");
      return;
    }

    const cfHandle = userObj.cfHandle;

    let response = await axios.get(
      `${process.env.CF_GROUP_SCRAPER_URL}?handle=${cfHandle}&key=${process.env.CF_GROUP_SCRAPER_KEY}`
    );

    const { data } = response;
    if (data.err === undefined) message.reply(data.responseMessage);
    if (data.err !== undefined) {
      throw new Error(data.err);
    }
  },
};
