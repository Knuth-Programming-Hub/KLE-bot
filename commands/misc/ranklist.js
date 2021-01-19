const mongo = require("../../mongo");
const User = require("../../models/user.model");
const axios = require("axios");

// getting the ratings through the handles
const getCfUserInfo = async (list) => {
  // https://codeforces.com/apiHelp/methods#user.info
  let url = "https://codeforces.com/api/user.info?handles=";
  for (let elem of list) {
    url += `${elem[1]};`;
  }

  await axios.get(url).then((res) => {
    if (res.data.status === "FAILED") throw new Error(res.data.comment);

    const { result } = res.data;
    for (let i = 0; i < result.length; ++i) {
      list[i][2] = result[i].rating;
    }
  });
};

module.exports = {
  name: "!ranklist",
  description: "Get ranklist for JIIT students",
  usage:
    "```!ranklist\n\nFormat: !ranklist [batch]\nYou can enter multiple batches!```",
  execute: async (message, args) => {
    for (let elem of args) elem = Number(elem);

    let filter = {};
    if (args.length > 0) filter = { batch: { $in: args } };

    // fetching users from the database
    let list = [];
    await mongo().then(async (mongoose) => {
      try {
        await User.find(filter).then(async (docs) => {
          for (let user of docs) {
            if (user.cfHandle === undefined) continue;
            let batch = user.batch === undefined ? "" : user.batch;
            list.push([user.discordId, user.cfHandle, 0, batch]);
          }
        });
      } finally {
        mongoose.connection.close();
      }
    });

    if (list.length === 0) {
      message.channel.send("No members found! 😅");
      return;
    }

    await getCfUserInfo(list);

    for (let arr of list) {
      const member = await message.guild.members.fetch(arr[0]);
      arr[0] = member.user.username;
    }

    list.sort((a, b) => b[2] - a[2]);

    // presentation
    for (let i in list) {
      list[i].unshift(Number(i) + 1);
    }

    list.unshift(["#", "Name", "Handle", "Rating", "Batch"]);

    let maxWidth = Array(list[0].length).fill(0);
    for (let arr of list) {
      for (let i in maxWidth) {
        let temp = `${arr[i]}`;
        maxWidth[i] = Math.max(maxWidth[i], temp.length);
      }
    }

    let str = "```\n";
    for (let arr of list) {
      for (let i in maxWidth) {
        let temp = `${arr[i]}`;
        str += temp;
        for (let j = 0; j <= maxWidth[i] - temp.length; ++j) str += " ";
      }
      str += "\n";

      if (arr[0] === "#") {
        for (let i in maxWidth) {
          for (let j = 0; j < maxWidth[i]; ++j) str += "-";
          str += " ";
        }
        str += "\n";
      }
    }
    str += "```";

    // using "embed"
    message.channel.send({
      embed: {
        color: 3447003,
        description: `${str}`,
      },
    });
  },
};
