const Discord = require("discord.js");

module.exports = {
  name: "!telegram",
  description: "Telegram Group",
  usage:
    " ```!telegram\n\nType the command to get the link to the Telegram Group.```",
  execute(message, args) {
    const telegram = new Discord.MessageEmbed()
      .setTitle("Join our Telegram Group")
      .setURL("https://t.me/joinchat/LGo0IhZoPRjRjBJHJPf3OA");
    message.channel.send(telegram);
  },
};
