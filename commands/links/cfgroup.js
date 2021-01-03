const Discord = require("discord.js");

module.exports = {
  name: "!cfgroup",
  description: "CF Group",
  usage:
    " ```!cfgroup\n\nType the command to get the link to the CodeForces Group.```",
  execute(message, args) {
    const github = new Discord.MessageEmbed()
      .setTitle("Join our CodeForces Group")
      .setURL("https://codeforces.com/group/IUJm1OmeBo");
    message.channel.send(github);
  },
};
