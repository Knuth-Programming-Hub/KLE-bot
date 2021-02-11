const Discord = require("discord.js");

module.exports = {
  name: "github",
  description: "Github Org",
  usage: (prefix) => `\`\`\`
${prefix}github

Type the command to get the link to the GitHub organisation.
\`\`\``,
  execute(message, args, prefix) {
    const github = new Discord.MessageEmbed()
      .setTitle("Take a look at our GitHub organisation")
      .setURL("https://github.com/Knuth-Programming-Hub");
    message.channel.send(github);
  },
};
