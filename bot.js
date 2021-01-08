require("dotenv").config();

const { join } = require("path");
const Discord = require("discord.js");
const getFiles = require("./getFiles");
const remind = require("./remind");
const addRole = require("./utils/addRole");
const verify = require("./verify");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Greet a new user
bot.on("guildMemberAdd", (member) => {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "welcome"
  );

  if (!channel) return;

  let name = member.user.username;
  let welcomeEmbed = new Discord.MessageEmbed()
    .setColor("#176ffc")
    .setTitle(`Yay! ${name} you made it to KPH discord Server `)
    .setDescription(
      `I am your friendly bot written in Javascript, Feel free to tell us more about yourself.\nIf you wish to be identified as JIITian, send !verify in #general.`
    )
    .setFooter("Use !help command to know more about me ");
  channel.send(welcomeEmbed);
  verify(bot, member);
});

bot.on("ready", async () => {
  await getFiles("./commands")
    .then((files) => {
      for (const file of files) {
        const command = require(file);
        bot.commands.set(command.name, command);
      }
    })
    .catch((err) => console.log(err));
  console.log("The KLE bot is online!");
});

setInterval(() => remind(bot), 3000000);

bot.on("message", (message) => {
  const args = message.content.trim().split(/\r\n|\r|\n| +/);
  const command = args.shift().toLowerCase();

  console.log(command);

  // simulating "guildMemberAdd"
  if (command === "!verify") {
    verify(bot, message.author);
    return;
  }

  // If a command is not present , log the default message
  if (!bot.commands.has(command)) {
    if (command[0] === "!") bot.commands.get("!invalid").execute(message, args);
    return;
  }

  // otherwise execute that command
  try {
    bot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("there was an error trying to execute that command!");
  }
});

bot.login(process.env.BOT_TOKEN);

// web server
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});
server.listen(3000);
