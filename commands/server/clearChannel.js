module.exports = {
  name: "clearchannel",
  permission: "*",
  description: "Delete all the messages from a channel",
  usage: (prefix) => `\`\`\`
${prefix}clearchannel

Simply type the command to clear the messages of the current channel.
Be very careful when using this command!
\`\`\``,
  execute: (message, args, prefix) => {
    message.channel.messages.fetch().then((res) => {
      message.channel.bulkDelete(res);
    });
  },
};
