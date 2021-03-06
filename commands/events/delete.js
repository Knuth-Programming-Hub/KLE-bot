const mongo = require("../../mongo");
const Event = require("../../models/event.model");
const { hasRole } = require("../../utils/guildMemberHandlers");

const parentName = "events";
const name = "delete";

module.exports = {
  parentName,
  name,
  permission: "*",
  description: "Delete an event",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Pass the event S.No. according to ${prefix}${parentName} showevents to delete that particular event.
\`\`\``,
  execute: async (bot, message, args, prefix) => {
    const admin = await hasRole(bot, message.author.id, "Admin");
    if (admin === false) {
      message.reply("you do not have permission to run this command.");
      return;
    }

    if (args.length !== 1) {
      message.channel.send(
        `Wrong format! Use ${prefix}help ${parentName} ${name} to know about usage.`
      );
      return;
    }

    const index = parseInt(args[0]) - 1;

    await mongo().then(async (mongoose) => {
      try {
        await Event.find()
          .sort("date")
          .then(async (response) => {
            const id = response[index]._id;
            await Event.findByIdAndRemove(id).then((response) => {
              message.channel.send("Event deleted successfully! 🔥");
            });
          });
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
