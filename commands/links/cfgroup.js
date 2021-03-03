const Discord = require("discord.js");

const parentName = "links";
const name = "cfgroup";

module.exports = {
  parentName,
  name,
  description: "CF Group",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the link to the CodeForces Group.
\`\`\``,
  execute(message, args, prefix) {
    const github = new Discord.MessageEmbed()
      .setTitle("Join our CodeForces Group")
      .setURL("https://codeforces.com/group/IUJm1OmeBo");
    message.channel.send(github);
  },
};
