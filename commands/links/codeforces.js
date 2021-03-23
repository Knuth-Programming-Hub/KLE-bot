const Discord = require("discord.js");

const parentName = "links";
const name = "codeforces";

module.exports = {
  parentName,
  name,
  description: "CF Group",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the link to the CodeForces Group.
\`\`\``,
  execute: (bot, message, args, prefix) => {
    const github = new Discord.MessageEmbed()
      .setTitle("Join our CodeForces Group")
      .setURL("https://codeforces.com/group/IUJm1OmeBo");
    message.channel.send(github);
  },
};
