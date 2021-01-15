module.exports = {
  name: "!clearchannel",
  permission: "*",
  description: "Delete all the messages from a channel",
  usage:
    "```!clearchannel\n\nSimply type the command to clear the messages of the current channel.\nBe very careful when using this command!```",
  execute: (message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
      message.channel.send("You do not have permission to run this command.");
      return;
    }

    message.channel.messages.fetch().then((res) => {
      message.channel.bulkDelete(res);
    });
  },
};
