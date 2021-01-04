const { MessageEmbed } = require("discord.js");
const mongo = require("./mongo");
const Event = require("./models/event.model");

const getDateAndTime = (dateObj) => {
  dateObj = dateObj.toString();
  const pos = dateObj.indexOf(":") - 2;
  return [dateObj.substring(4, pos), dateObj.substring(pos)];
};

const formatDate = (today) => {
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  const date = yyyy + "/" + mm + "/" + dd;
  return date;
};
const compute = (eventObjects) => {
  const events = [];
  for (let index in eventObjects) {
    const elem = eventObjects[index];

    index = String(parseInt(index) + 1);
    const dateAndTime = getDateAndTime(elem.date);

    events.push({
      name: `${index}. ${elem.title}`,
      value: `**Date:** ${dateAndTime[0]}
               **Time:** ${dateAndTime[1]}  
               **Venue:** ${elem.venue}`,
      inline: false,
    });
  }

  return events;
};

module.exports = async (bot) => {
  const channels = await bot.channels.cache;

  let channel;
  channels.forEach((ch) => {
    if (ch.name === "general") {
      channel = ch;
    }
  });
  await mongo().then(async (mongoose) => {
    try {
      await Event.find()
        .sort("date")
        .then((response) => {
          events = [];
          var today = new Date();
          for (let index in response) {
            if (formatDate(response[index].date) === formatDate(today)) {
              events.push(response[index]);
            }
          }

          eventFormatted = compute(events);
          if (eventFormatted.length) {
            const embed = new MessageEmbed()
              .setTitle("Reminder!")
              .setColor(0xff0000)
              .setDescription("Hello, this is a reminder!")
              .addFields(eventFormatted);
            channel.send(embed);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } finally {
      mongoose.connection.close();
    }
  });
};
