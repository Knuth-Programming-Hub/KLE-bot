module.exports = {
  name: "invalid",
  description: "Invalid Command",
  execute: (bot, message, args, prefix) => {
    message.channel.send(
      `Looks like that's an invalid command , Try ${prefix}help for reference.`
    );
  },
};
