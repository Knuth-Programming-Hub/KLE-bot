const mongo = require("../../mongo");
const User = require("../../models/discord-member.model");
const ranklistForServer = require("../../utils/ranklist/ranklistForServer");
const ranklistForContest = require("../../utils/ranklist/ranklistForContest");

// object with keys as cfHandles and values as objects with keys as "discordId", "batch"
let userList;

const commandName = "ranklist";

module.exports = {
  name: commandName,
  description: "Get ranklist for server and contests",
  usage: (prefix) => `\`\`\`
${prefix}${commandName}\n
Format: 
${prefix}${commandName} [id=<contest-id>] [batches...]\n
Note: 
- To get unofficial standings use id#=<contest-id>
- You can enter multiple batches.
- To get the server ranklist, don't enter any arguments.\n
Example:
${prefix}${commandName} id=123 2021 2022
\`\`\``,
  execute: async (bot, message, args, prefix) => {
    let contestId = null;
    let showUnofficial = false;
    if (args.length > 0) {
      if (args[0].startsWith("id=")) {
        contestId = args[0].substring(3);
        args = args.slice(1);
      } else if (args[0].startsWith("id#=")) {
        contestId = args[0].substring(4);
        args = args.slice(1);
        showUnofficial = true;
      }
    }

    for (let elem of args) elem = Number(elem);

    let filter = {};
    if (args.length > 0) filter = { batch: { $in: args } };

    // fetching users from the database
    userList = {};
    await mongo().then(async (mongoose) => {
      try {
        await User.find(filter).then(async (docs) => {
          for (let user of docs) {
            if (
              user.cfHandle === undefined ||
              user.cfHandle === null ||
              user.isMember === false
            )
              continue;
            let batch = user.batch === undefined ? "" : user.batch;
            userList[user.cfHandle] = { discordId: user._id, batch };
          }
        });
      } finally {
        mongoose.connection.close();
      }
    });

    if (Object.keys(userList).length === 0) {
      message.channel.send("No members found! 😅");
      return;
    }

    if (contestId !== null)
      await ranklistForContest(
        message,
        args,
        userList,
        contestId,
        showUnofficial
      );
    else await ranklistForServer(message, userList);
  },
};
