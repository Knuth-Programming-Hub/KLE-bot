const Discord = require("discord.js");

const parentName = "links";
const name = "github";

module.exports = {
  parentName,
  name,
  description: "Github Org",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the link to the GitHub organisation.
\`\`\``,
  execute: (bot, message, args, prefix) => {
    const github = new Discord.MessageEmbed()
      .setTitle("Take a look at our GitHub organisation")
      .setURL("https://github.com/Knuth-Programming-Hub");
    message.channel.send(github);
  },
};
