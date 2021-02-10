const Discord = require("discord.js");
const mongo = require("../../mongo");
const Event = require("../../models/event.model");

const getDateAndTime = (dateObj) => {
  dateObj = dateObj.toString();

  const pos = dateObj.indexOf(":") - 2;
  return [
    dateObj.substring(4, pos),
    dateObj.substring(pos, pos + 5) + " (IST)",
  ];
};

const compute = (eventObject) => {
  const dateAndTime = getDateAndTime(eventObject.date);

  const nextEvent = [];
  nextEvent.push({
    name: `${eventObject.title}`,
    value: `**Date:** ${dateAndTime[0]}
         **Time:** ${dateAndTime[1]}  
         **Venue:** ${eventObject.venue}`,
    inline: false,
  });

  return nextEvent;
};

module.exports = {
  name: "nextevent",
  description: "Show next event",
  usage: (prefix) => `\`\`\`
${prefix}nextevent

Type the command to view the next upcoming event.
\`\`\``,
  execute: async (message, args, prefix) => {
    await mongo().then(async (mongoose) => {
      try {
        await Event.find()
          .sort("date")
          .then((response) => {
            if (response.length > 0) {
              const nextEvent = compute(response[0]);
              const nextEventEmbedded = new Discord.MessageEmbed()
                .setTitle("Next Event")
                .addFields(nextEvent);
              message.channel.send(nextEventEmbedded);
            } else message.channel.send("No event scheduled. 😅");
          });
      } finally {
        mongoose.connection.close();
      }
    });
  },
};
