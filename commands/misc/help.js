const Discord = require("discord.js");
const getFiles = require("../../getFiles");

module.exports = {
  name: "!help",
  description: "List available commands",
  usage:
    "```!help\n\nuse !help to list all the commands\nuse !help <command-name> to get more details about the particular command```",
  execute: async (message, args) => {
    if (args.length >= 2) {
      message.channel.send("Wrong Format! Try !help help to know more.");
      return;
    }

    if (args.length === 1) {
      if (args[0] === "help") {
        message.channel.send(
          " ```!help\n\nuse !help to list all the commands\nuse !help <command-name> to get more details about the particular command```"
        );

        return;
      }

      let flag = 0;
      await getFiles("./commands").then((files) => {
        for (let file of files) {
          let filePath = String(file);
          // thanks: https://stackoverflow.com/a/423385/9950042
          var filename = filePath.replace(/^.*[\\\/]/, ""); // Get Filename.
          filename = filename.substring(0, filename.length - 3).toLowerCase(); // Remove extension.
          if (args[0].toLowerCase() == filename) {
            const command = require(filePath);
            message.channel.send(command.usage);
            flag = 1; // command exists.
            return;
          }
        }
      });

      if (!flag)
        message.channel.send(
          "Command not found! Try !help to view the available commands."
        );
      return;
    }

    let commands = [];
    await getFiles("./commands").then((files) => {
      for (let file of files) {
        let filePath = String(file);
        var filename = filePath.replace(/^.*[\\\/]/, "");
        filename = filename.substring(0, filename.length - 3).toLowerCase();
        if (filename === "invalid") {
          continue;
        }
        const command = require(filePath);
        commands.push({
          name: `${command.name} ${
            command.permission === undefined ? "" : command.permission
          }`,
          value: command.description,
          inline: false,
        });
      }
    });

    const commandsEmbedded = new Discord.MessageEmbed()
      .setTitle("Available commands")
      .addFields(commands)
      .setFooter("* - only for admins");

    message.channel.send(commandsEmbedded);
  },
};
