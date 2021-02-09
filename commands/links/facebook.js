const Discord = require("discord.js");

module.exports = {
  name: "facebook",
  description: "Facebook Group",
  usage: (prefix) => `\`\`\`
${prefix}facebook

Type the command to get the link to the Facebook Group.
\`\`\``,
  execute(message, args, prefix) {
    const facebook = new Discord.MessageEmbed()
      .setTitle("Join us on Facebook")
      .setURL("https://www.facebook.com/groups/jiit.knuth");
    message.channel.send(facebook);
  },
};
