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

// A function for checking if the date or time has been already passed or not
function checkSchedule(args) {
  
  const decidedDay = args[1];
  const decidedTime = args[3];
  const curDay = new Date().toLocaleDateString(undefined, {timeZone: 'Asia/Kolkata'});
  const curTime = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: "numeric",
    minute: "numeric",
    timeZone: 'Asia/Kolkata',
  });

  if (Date.parse(decidedDay) < Date.parse(curDay)) {
    return false;
  }

  if (Date.parse(decidedTime) < Date.parse(curTime)) {
    return false;
  }

  return true;

}

const compute = (args) => {
  args = args.filter((elem) => elem !== "");
  args = args.map((elem) => elem.toLowerCase());

  if (args[0] !== "date:" || args[2] !== "time:" || args[4] !== "title:")
    return false;

  eventObj.date = getDate(args[1], args[3]);

  eventObj.title = "";
  eventObj.venue = "";

  let flag = 0;
  for (let i = 5; i < args.length; i += 1) {
    if (!flag && args[i] === "venue:") {
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
  usage: " ```!addevent\n\nFormat:\ndate: DD/MM/YYYY\ntime: HH:MM (24 hr)\ntitle: ...\nvenue: ...```",
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

    if (checkSchedule(args) === false) {
      message.channel.send(
        "Scheduled Date or Time has already passed, Try creating a valid event"
      );
      return;
    }

    console.log(args);

    let str = "";

    await mongo().then(async (mongoose) => {
      try {
        const event = new Event(eventObj);

        await event
          .save()
          .then((doc) => {
            str = "Event Successfully Added! 😀";
          })
          .catch((err) => {
            str = "There was some error. 🙁";
            console.log(err);
          });
      } finally {
        mongoose.connection.close();
      }
    });

    message.channel.send(str);
  },
};