const Discord = require("discord.js");

const parentName = "links";
const name = "telegram";

module.exports = {
  parentName,
  name,
  description: "Telegram Group",
  usage: (prefix) => `\`\`\`
${prefix}${parentName} ${name}

Type the command to get the link to the Telegram Group.
\`\`\``,
  execute: (bot, message, args, prefix) => {
    const telegram = new Discord.MessageEmbed()
      .setTitle("Join our Telegram Group")
      .setURL("https://t.me/joinchat/LGo0IhZoPRjRjBJHJPf3OA");
    message.channel.send(telegram);
  },
};
