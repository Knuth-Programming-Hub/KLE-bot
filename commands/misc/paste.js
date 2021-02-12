const octokit = require("../../octokit");
const { getDateAndTime } = require("../../utils/getDateAndTime");

const codeObj = {
  filename: "",
  code: "",
};

const compute = (args, prefix) => {
  const codePos = args.indexOf("\n");

  if (codePos === -1) return false;

  codeObj.filename = "";
  for (
    let i = codePos - 1;
    args[i] !== " " && args.substring(0, i + 1) !== `${prefix}paste`;
    --i
  )
    codeObj.filename += args[i];

  codeObj.filename = codeObj.filename.split("").reverse().join("");
  codeObj.code = args.substring(codePos + 1);

  return codeObj.code !== "";
};

module.exports = {
  name: "paste",
  description: "Paste code and get a link for it",
  usage: (prefix) => `\`\`\`
${prefix}paste

Format:
${prefix}paste <filename>
<code>
\`\`\``,
  execute: async (message, recievedArgs, prefix) => {
    const args = String(message.content.trim());

    if (!compute(args, prefix)) {
      message.channel.send(
        `Wrong format! Make sure the code is not empty. Use ${prefix}help paste to know about usage.`
      );
      return;
    }

    await octokit.gists
      .create({
        public: false,
        files: {
          [codeObj.filename]: { content: codeObj.code },
        },
      })
      .then((gist) => {
        const dateObj = new Date();
        const offsetMinutes = 330; // for IST (+5:30)
        dateObj.setMinutes(dateObj.getMinutes() - offsetMinutes);
        const dateAndTime = getDateAndTime(dateObj);
        let timeString = dateAndTime[0] + dateAndTime[1];
        const successMessage = {
          content: `<@${message.author.id}> the code is ready! 😀`,
          embed: {
            title: "Find it here!",
            url: `${gist.data.html_url}`,
            color: 4045991,
            description: `Created at ${timeString}.`,
          },
        };
        message.channel.send(successMessage);
      });

    message.delete();
  },
};
