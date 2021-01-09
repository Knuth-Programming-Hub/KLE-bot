require("dotenv").config();

const Discord = require("discord.js");
const getFiles = require("./getFiles");
const remind = require("./remind");
const verify = require("./verify");
const user = require("./utils/usersHandlers");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

// Greet a new user
bot.on("guildMemberAdd", async (member) => {
  const channel = member.guild.channels.cache.find(
    (ch) => ch.name === "welcome"
  );

  if (!channel) return;

  let name = member.user.username;
  let welcomeEmbed = new Discord.MessageEmbed()
    .setColor("#176ffc")
    .setTitle(`Yay! ${name} you made it to KPH discord Server `)
    .setDescription(
      `I am your friendly bot written in Javascript, Feel free to tell us more about yourself.\n *If* you wish to be identified as JIITian, send !verify in the #verify channel :D.`
    )
    .setFooter("Use !help command to know more about me ");
  channel.send(welcomeEmbed);

  // adding the member to the "users" collection in DB
  const exists = await user.existsInUsers(member.id);
  if (exists === false) {
    await user.add(member.id);
  }
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
  if (message.channel.type === "dm") return;

  const args = message.content.trim().split(/\r\n|\r|\n| +/); // removes any whitespace in the message
  const command = args.shift().toLowerCase();

  if (message.channel.id === process.env.VERIFY_CHANNEL_ID) {
    if (command === "!verify") verify(bot, message.author);
    return;
  }

  // If a command is not present, log the default message
  if (!bot.commands.has(command)) {
    if (command[0] === "!") bot.commands.get("!invalid").execute(message, args);
    return;
  }

  // otherwise execute that command
  try {
    bot.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was some error in executing that command! 🙁");
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
