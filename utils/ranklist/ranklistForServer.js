const makeRequest = require("../../api/codeforces");

// getting the ratings through the handles
const getCfUserInfo = async (resultList) => {
  let handles = "";
  for (let elem of resultList) {
    handles += `${elem[1]};`;
  }

  let res = null;

  // https://codeforces.com/apiHelp/methods#user.info
  try {
    res = await makeRequest("user.info", [["handles", handles]]);
  } catch (err) {
    throw new Error(err);
  }
  if (res.data.status === "FAILED") throw new Error(res.data.comment);

  const { result } = res.data;
  for (let i = 0; i < result.length; ++i) {
    resultList[i].push(result[i].rating);
  }
};

const ranklistForServer = async (message, userList) => {
  let resultList = [];
  for (let [key, value] of Object.entries(userList))
    resultList.push([value.discordId, key, value.batch]);

  await getCfUserInfo(resultList);

  for (let arr of resultList) {
    const member = await message.guild.members.fetch(arr[0]);
    arr[0] = member.user.username;
  }

  resultList.sort((a, b) => b[3] - a[3]);
  resultList = resultList.slice(0, Math.min(11, resultList.length)); // taking only top 10

  // presentation
  for (let i in resultList) {
    resultList[i].unshift(Number(i) + 1);
  }

  resultList.unshift(["#", "Name", "Handle", "Batch", "Rating"]);

  let maxWidth = Array(resultList[0].length).fill(0);
  for (let arr of resultList) {
    for (let i in maxWidth) {
      let temp = `${arr[i]}`;
      maxWidth[i] = Math.max(maxWidth[i], temp.length);
    }
  }

  let str = "```\n";
  for (let arr of resultList) {
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
};

module.exports = ranklistForServer;
