const getFiles = require("../getFiles");

const getChildren = async (parentCommand) => {
  const files = await getFiles(`./commands/${parentCommand}`);

  const index = files.findIndex((elem) => elem.includes(`${parentCommand}.js`));
  files.splice(index, 1);

  return files;
};

const displayUsage = async (name, description, prefix) => {
  let str = "```\n";
  str += `\n${prefix}${name}\n${description}\n\n`;
  str += "Commands:\n";

  let childrenPaths;
  await getChildren(name).then((files) => {
    childrenPaths = files;
  });

  for (let path of childrenPaths) {
    const command = require(path);
    str += `\t${command.name}${
      command.permission === undefined ? "" : command.permission
    } : ${command.description}\n`;
  }

  str += "```";
  return str;
};

const getSubCommand = async (name, args) => {
  let childrenPaths;
  await getChildren(name).then((files) => {
    childrenPaths = files;
  });

  const subCommandName = args[0].toLowerCase();

  for (const file of childrenPaths) {
    let filePath = String(file);
    let fileName = filePath.replace(/^.*[\\\/]/, "");
    fileName = fileName.substring(0, fileName.length - 3).toLowerCase();

    if (subCommandName === fileName) {
      const command = require(filePath);
      return command;
    }
  }

  return null;
};

const getCommandObj = (name, description, isParent) => {
  return {
    name,
    description,
    isParent,
    usage: async (prefix) => await displayUsage(name, description, prefix),
    execute: async (bot, message, args, prefix) => {
      if (args.length === 0) {
        message.channel.send(await displayUsage(name, description, prefix));
      } else {
        const subCommand = await getSubCommand(name, args);
        if (subCommand === null)
          message.channel.send(
            `Command not found! try ${prefix}help ${name} to view the available commands.`
          );
        else {
          args.splice(0, 1);
          await subCommand.execute(bot, message, args, prefix);
        }
      }
    },
  };
};

module.exports = {
  getChildren,
  displayUsage,
  getSubCommand,
  getCommandObj,
};
