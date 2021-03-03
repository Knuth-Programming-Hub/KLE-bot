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

const executeSubCommand = async (name, message, args, prefix) => {
  const subCommandName = args.shift().toLowerCase();

  let childrenPaths;
  await getChildren(name).then((files) => {
    childrenPaths = files;
  });

  for (const file of childrenPaths) {
    let filePath = String(file);
    let fileName = filePath.replace(/^.*[\\\/]/, "");
    fileName = fileName.substring(0, fileName.length - 3).toLowerCase();

    if (subCommandName === fileName) {
      const command = require(filePath);
      command.execute(message, args, prefix);
      break;
    }
  }
};

const getCommandObj = (name, description, message, args, prefix) => {
  return {
    name,
    description,
    usage: async (prefix) => await displayUsage(name, description, prefix),
    execute: async (message, args, prefix) => {
      if (args.length === 0) {
        message.channel.send(await displayUsage(name, description, prefix));
      } else {
        executeSubCommand(name, message, args, prefix);
      }
    },
  };
};

module.exports = {
  getChildren,
  displayUsage,
  executeSubCommand,
  getCommandObj,
};
