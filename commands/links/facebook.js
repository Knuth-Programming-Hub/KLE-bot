const Discord = require("discord.js");

const parentName = "links";
const name = "facebook";

module.exports = {
  parentName,
  name,
  description: "Facebook Group",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the link to the Facebook Group.
\`\`\``,
  execute(message, args, prefix) {
    const facebook = new Discord.MessageEmbed()
      .setTitle("Join us on Facebook")
      .setURL("https://www.facebook.com/groups/jiit.knuth");
    message.channel.send(facebook);
  },
};
