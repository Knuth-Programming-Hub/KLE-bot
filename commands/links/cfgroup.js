const Discord = require("discord.js");

module.exports = {
  name: "cfgroup",
  description: "CF Group",
  usage: (prefix) => `\`\`\`
${prefix}cfgroup

Type the command to get the link to the CodeForces Group.
\`\`\``,
  execute(message, args, prefix) {
    const github = new Discord.MessageEmbed()
      .setTitle("Join our CodeForces Group")
      .setURL("https://codeforces.com/group/IUJm1OmeBo");
    message.channel.send(github);
  },
};
