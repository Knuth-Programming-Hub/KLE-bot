const mongo = require("../../mongo");
const Event = require("../../models/event.model");

const getDate = (date, time) => {
  const dateArr = date.split(/[-/]/);
  dateArr[1] = String(parseInt(dateArr[1]) - 1);
  dateArr.reverse();
  const timeArr = time.split(":");

  // new Date(year, month, date, hours, minutes, seconds, ms)
  const res = new Date(...dateArr, ...timeArr);
  return res;
};

const eventObj = {
  date: null,
  title: "",
  venue: "",
};

function checkSchedule() {
  const curTime = new Date();
  return Date.parse(eventObj.date) >= Date.parse(curTime);
}

const compute = (args) => {
  args = args.filter((elem) => elem !== "");

  if (
    args[0].toLowerCase() !== "date:" ||
    args[2].toLowerCase() !== "time:" ||
    args[4].toLowerCase() !== "title:"
  )
    return false;

  eventObj.date = getDate(args[1], args[3]);

  eventObj.title = "";
  eventObj.venue = "";

  let flag = 0;
  for (let i = 5; i < args.length; i += 1) {
    if (!flag && args[i].toLowerCase() === "venue:") {
      flag = 1;
      continue;
    }

    if (!flag) {
      if (eventObj.title.length) eventObj.title += " ";

      eventObj.title += args[i];
    } else eventObj.venue += args[i];
  }

  return flag ? true : false;
};

module.exports = {
  name: "!addevent",
  permission: "*",
  description: "Add an event",
  usage:
    " ```!addevent\n\nFormat:\ndate: DD/MM/YYYY\ntime: HH:MM (24 hr)\ntitle: ...\nvenue: ...```",
  execute: async (message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send("You do not have permission to run this command.");
      return;
    }

    if (!compute(args)) {
      message.channel.send(
        "Wrong format! Use !help addevent to know about usage."
      );
      return;
    }

    if (!checkSchedule()) {
      message.channel.send(
        "Scheduled Date or Time has already passed. Try creating a valid event..."
      );
      return;
    }

    let str = "";

    await mongo().then(async (mongoose) => {
      try {
        const event = new Event(eventObj);
        await event.save().then((doc) => {
          str = "Event Successfully Added! 😀";
        });
      } finally {
        mongoose.connection.close();
      }
    });

    message.channel.send(str);
  },
};
