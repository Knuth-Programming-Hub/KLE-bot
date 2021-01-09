const octokit = require("../../octokit");

const codeObj = {
  filename: "",
  code: "",
};

const compute = (args) => {
  const codePos = args.indexOf("\n");

  if (codePos === -1) return false;

  codeObj.filename = "";
  for (
    let i = codePos - 1;
    args[i] !== " " && args.substring(0, i + 1) !== "!paste";
    --i
  )
    codeObj.filename += args[i];

  codeObj.filename = codeObj.filename.split("").reverse().join("");
  codeObj.code = args.substring(codePos + 1);

  return codeObj.code !== "";
};

module.exports = {
  name: "!paste",
  description: "Paste code and get a link for it",
  usage: "```!paste\n\nFormat:\n!paste <filename>\n<code>```",
  execute: (message, recievedArgs) => {
    const args = String(message.content.trim());

    if (!compute(args)) {
      message.channel.send(
        "Wrong format! Make sure the code is not empty. Use !help paste to know about usage."
      );
      return;
    }

    octokit.gists
      .create({
        public: false,
        files: {
          [codeObj.filename]: { content: codeObj.code },
        },
      })
      .then((gist) => {
        const successMessage = {
          content: `<@${message.author.id}> the code is ready! 😀`,
          embed: {
            title: "Find it here!",
            url: `${gist.data.html_url}`,
            color: 4045991,
          },
        };
        message.channel.send(successMessage);
      })
      .catch((err) => {
        message.reply("There was some error. 🙁");
        console.log(err);
      });
  },
};
