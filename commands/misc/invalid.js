module.exports = {
  name: "!invalid",
  description: "Invalid Command",
  execute(message, args) {
    message.channel.send(
      "Looks like that's an invalid command , Try !help for reference."
    );
  },
};
