const mongo = require("../../mongo");
const User = require("../../models/discord-member.model");
const makeRequest = require("../../api/codeforces");
const { getUserFromCfHandle } = require("../../utils/db/discordMemberHandlers");
const { getDateAndTime } = require("../../utils/getDateAndTime");

// object with keys as cfHandles and values as objects with keys as "discordId", "batch"
let userList;

// getting the ratings through the handles
const getCfUserInfo = async (resultList) => {
  let handles = "";
  for (let elem of resultList) {
    handles += `${elem[1]};`;
  }

  // https://codeforces.com/apiHelp/methods#user.info
  const res = await makeRequest("user.info", [["handles", handles]]);

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

const computeStartTime = (startTimeSeconds) => {
  const dateObj = new Date(startTimeSeconds * 1000);
  const dateAndTime = getDateAndTime(dateObj);
  const res = `${dateAndTime[0]}, ${dateAndTime[1]}`;
  return res;
};

const computeDuration = (durationSeconds) => {
  const dateObj = new Date(durationSeconds * 1000);
  let res = "";
  if (dateObj.getDay() !== 0) res += `${dateObj.getDay()}d `;
  if (res.length && dateObj.getHours() !== 0) res += `${dateObj.getHours()}h `;
  if (res.length && dateObj.getMinutes() !== 0)
    res += `${dateObj.getMinutes()}m `;

  return res;
};

const ranklistForContest = async (
  message,
  args,
  userList,
  contestId,
  showUnofficial
) => {
  /* make the API request */
  let handles = "";
  for (let elem in userList) {
    handles += `${elem};`;
  }

  if (showUnofficial === true) showUnofficial = "true";
  else showUnofficial = "false";

  // https://codeforces.com/apiHelp/methods#contest.standings
  const res = await makeRequest("contest.standings", [
    ["contestId", contestId],
    ["handles", handles],
    ["showUnofficial", showUnofficial],
  ]);

  if (res.data.status === "FAILED") throw new Error(res.data.comment);

  const { result } = res.data;

  /* display contest info */
  const { contest } = result;
  let contestUrl = `https://codeforces.com/`;
  if (contest.preparedBy === "hp1999") contestUrl += "gym/";
  else contestUrl += "contest/";
  contestUrl += contest.id;
  const startTime = computeStartTime(contest.startTimeSeconds);
  const duration = computeDuration(contest.durationSeconds);
  message.channel.send({
    embed: {
      title: contest.name,
      url: contestUrl,
      color: contest.phase === "FINISHED" ? 15158332 : 15844367,
      description: contest.description,
      fields: [
        {
          name: "Phase",
          value: contest.phase,
        },
        {
          name: "When",
          value: `${startTime} | ${duration}`,
        },
      ],
    },
  });

  /* extract info for ranklist */
  const { rows } = result;
  const contestType = result.contest.type;
  let resultList = [];
  for (let ranklistRow of rows) {
    // data for one "party"
    // note: there can be multiple members (in the case of a team)
    let userResult = {
      rank: "",
      name: "", // Discord username for individual participants and team name for teams
      handles: [],
      batches: [],
      points: 0,
      penalty: 0,
    };

    // rank
    userResult.rank = ranklistRow.rank;

    // handles, names, batches
    const partyMembers = ranklistRow.party.members;
    let batchIsOk = false;
    for (let member of partyMembers) {
      const cfHandle = member.handle;
      userResult.handles.push(cfHandle);

      let batch = null;
      if (userList[cfHandle] !== undefined) {
        const guildMember = await message.guild.members.fetch(
          userList[cfHandle].discordId
        );
        if (partyMembers.length === 1)
          userResult.name = guildMember.user.username;
        batch =
          userList[cfHandle].batch !== undefined
            ? userList[cfHandle].batch
            : "NA";
      } else if (partyMembers.length > 1) {
        const user = await getUserFromCfHandle(cfHandle);
        batch = user.batch !== undefined ? user.batch : "NA";
      }

      userResult.batches.push(batch);

      if (batch === null || batch === "NA") continue;

      batch = String(batch);
      if (
        args.length === 0 ||
        args.find((elem) => elem === batch) !== undefined
      )
        batchIsOk = true;
    }

    // the party doesn't follow the batch-filter as specified in the message
    if (batchIsOk === false) continue;

    // if team, assign name to team name
    if (partyMembers.length > 1) userResult.name = ranklistRow.party.teamName;

    // for unoffficial participant
    if (ranklistRow.party.participantType !== "CONTESTANT")
      userResult.handles.push("(#)");

    // if contest type is ICPC, penalty field would be displayed
    userResult.points = ranklistRow.points;
    if (contestType === "ICPC") userResult.penalty = ranklistRow.penalty;

    // problem results
    const { problems } = result;
    const problemResults = ranklistRow.problemResults;
    for (let i in problemResults) {
      const problemResult = problemResults[i];
      // using the problem index as key
      userResult[problems[i].index] = {
        points: problemResult.points,
        rejectedAttemptCount: problemResult.rejectedAttemptCount,
      };
    }

    // push to list
    resultList.push(userResult);

    // limit set to top 10
    if (resultList.length >= 10) break;
  }

  // no members took part in the contest...
  if (resultList.length === 0) {
    message.channel.send("No members found in the contest ranklist! 😅");
    return;
  }

  /* display */

  // header
  resultList.unshift({
    rank: "#",
    name: "Name",
    handles: ["Handle"],
    batches: ["Batch"],
    points: "=",
    penalty: "-",
  });

  const { problems } = result;
  for (let problem of problems) resultList[0][problem.index] = problem.index;

  // max width for each field
  let maxWidth = {
    rank: 0,
    name: 0,
    handles: 0,
    batches: 0,
    points: 0,
    penalty: 0,
  };

  for (let problem of problems) maxWidth[problem.index] = 0;

  for (let obj of resultList) {
    for (let [key, value] of Object.entries(obj)) {
      if (contestType !== "ICPC" && key === "penalty") continue; // if contest is not ICPC style then "penalty" field will not be displayed because then it will always be 0

      let temp = "";
      // value is in the form of an array
      if (Array.isArray(value) === true) {
        // check for header-value
        if (obj["rank"] === "#") temp += `${value}`;
        else {
          for (let elem of value) temp += `${elem}-`;

          if (key === "handles" && temp.endsWith("(#)-")) {
            temp = temp.slice(0, temp.length - 1);
          }

          let pos = temp.lastIndexOf("-");
          temp = temp.substring(0, pos) + ": " + temp.substring(pos + 1);
        }
      } // value is in the form of an object
      else if (typeof value === "object") {
        for (let subValue of Object.values(value)) temp += `${subValue}/`;
        temp = temp.slice(0, temp.length - 1);
      } else temp += `${value}`;

      maxWidth[key] = Math.max(maxWidth[key], temp.length);
    }
  }

  // displaying the ranklist
  // yaml is used for syntax highlighting (':" and '#' convey special meaning)
  let str = "```yaml\n";
  for (let obj of resultList) {
    for (let [key, value] of Object.entries(obj)) {
      if (contestType !== "ICPC" && key === "penalty") continue; // if contest is not ICPC style then "penalty" field will not be displayed because then it will always be 0

      let temp = "";
      // value is in the form of an array
      if (Array.isArray(value) === true) {
        // check for header-value
        if (obj["rank"] === "#") temp += `${value}`;
        else {
          for (let elem of value) temp += `${elem}-`;

          if (key === "handles" && temp.endsWith("(#)-")) {
            temp = temp.slice(0, temp.length - 1);
          }

          let pos = temp.lastIndexOf("-");
          temp = temp.substring(0, pos) + ": " + temp.substring(pos + 1);
        }
      } // value is in the form of an object
      else if (typeof value === "object") {
        for (let subValue of Object.values(value)) temp += `${subValue}/`;
        temp = temp.slice(0, temp.length - 1);
      } else temp += `${value}`;

      str += temp;
      for (let j = 0; j <= maxWidth[key] - temp.length; ++j) str += " ";
    }
    str += "\n";

    if (obj.rank === "#") {
      for (let [key, value] of Object.entries(maxWidth)) {
        if (contestType !== "ICPC" && key === "penalty") continue;

        for (let j = 0; j < value; ++j) str += "_";
        str += " ";
      }
      str += "\n\n";
    }
  }

  for (let [key, value] of Object.entries(maxWidth)) {
    if (contestType !== "ICPC" && key === "penalty") continue;

    for (let j = 0; j < value; ++j) str += "_";
    str += " ";
  }
  str += "\n";
  str += "```";

  message.channel.send(str);
};

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
