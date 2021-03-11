const makeRequest = require("../../api/codeforces");
const { getUserFromCfHandle } = require("../../utils/db/discordMemberHandlers");
const { getDateAndTime } = require("../../utils/getDateAndTime");

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

module.exports = ranklistForContest;
