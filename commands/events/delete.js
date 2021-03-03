const mongo = require("../../mongo");
const Event = require("../../models/event.model");

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
  execute: async (message, args, prefix) => {
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
