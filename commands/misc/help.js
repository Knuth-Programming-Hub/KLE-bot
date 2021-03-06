const Discord = require("discord.js");

const helpCommandUsage = (prefix) => {
  return `\`\`\`
${prefix}help

use ${prefix}help to list all the commands
use ${prefix}help <command-name> to get more details about the particular command
\`\`\``;
};

module.exports = {
  name: "help",
  description: "List available commands",
  usage: (prefix) => helpCommandUsage(prefix),
  execute: async (bot, message, args, prefix) => {
    if (args.length >= 3) {
      message.channel.send(
        `Wrong Format! Try ${prefix}help help to know more.`
      );
      return;
    }

    const commands = [...bot.commands.values()];

    // help for a command is requested
    if (args.length > 0) {
      if (args.length === 1 && args[0] === "help") {
        message.channel.send(helpCommandUsage(prefix));
        return;
      }

      let flag = 0;
      if (args.length == 1) {
        for (const command of commands) {
          if (
            command.name !== "invalid" &&
            command.parentName === undefined &&
            args[0].toLowerCase() === command.name
          ) {
            message.channel.send(await command.usage(prefix));
            flag = 1;
            break;
          }
        }
      } else {
        for (const command of commands) {
          if (args[0].toLowerCase() === command.name) {
            if (command.isParent === true) {
              flag = 3;
              break;
            }

            flag = 2;
          }

          if (
            args[0].toLowerCase() === command.parentName &&
            args[1].toLowerCase() === command.name
          ) {
            message.channel.send(await command.usage(prefix));
            flag = 1;
            break;
          }
        }
      }

      if (!flag)
        message.channel.send(
          `Command not found! Try ${prefix}help to view the available commands.`
        );
      else if (flag == 2)
        message.channel.send(
          `\`${prefix}${args[0].toLowerCase()}\` doesn't have any subcommands! Try ${prefix}help to view the available commands.`
        );
      else if (flag == 3)
        message.channel.send(
          `\`${prefix}${args[0].toLowerCase()}\` doesn't have such subcommand! Try ${prefix}help ${args[0].toLowerCase()} to view the available commands.`
        );

      return;
    }

    // help - display available commands

    let commandList = [];
    for (const command of commands) {
      if (command.name === "invalid" || command.parentName !== undefined)
        continue;

      commandList.push({
        name: `${command.name} ${
          command.permission === undefined ? "" : command.permission
        }`,
        value: command.description,
        inline: false,
      });
    }

    const commandsEmbedded = new Discord.MessageEmbed()
      .setTitle("Available commands")
      .addFields(commandList)
      .setFooter("* - only for admins");

    message.channel.send(commandsEmbedded);
  },
};
