require("dotenv").config();

const Discord = require("discord.js");
const getFiles = require("./getFiles");
const remind = require("./remind");
const verify = require("./verify");
const user = require("./utils/usersHandlers");
const { sendCaptcha } = require("./utils/captcha");
const { handleIdentify } = require("./utils/TLE");
const { hasRole } = require("./utils/guildMemberHandlers");
const getPrefix = require("./utils/getCommandPrefix");

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

bot.on("guildMemberAdd", async (member) => {
  try {
    if (member.user.bot === true) return;

    const channel = member.guild.channels.cache.find(
      (ch) => ch.name === "welcome"
    );

    if (!channel) return;

    const prefix = await getPrefix();

    let name = member.user.username;
    let welcomeEmbed = new Discord.MessageEmbed()
      .setColor("#176ffc")
      .setTitle(`Yay! ${name} you made it to KPH discord Server `)
      .setDescription(
        `
I am your friendly bot written in Javascript.
**Check your DM to solve the captcha**.
*If* you wish to be identified as a JIITian, please send ${prefix}verify in the #verify channel :D.
`
      )
      .setFooter(`Use ${prefix}help command to know more about me.`);
    channel.send(welcomeEmbed);

    const passed = await sendCaptcha(bot, member.user);
    if (passed === false) return;

    // adding the member to the "users" collection in DB
    const exists = await user.existsInUsers(member.id);
    if (exists === false) {
      await user.add(member.id);
    }
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
  }
});

bot.on("ready", () => {
  getFiles("./commands")
    .then((files) => {
      for (const file of files) {
        const command = require(file);
        bot.commands.set(command.name, command);
      }
    })
    .catch((err) => console.log(err));
  console.log("The KLE bot is online!");
});

setInterval(async () => {
  try {
    await remind(bot);
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
  }
}, 3000000);

bot.on("message", async (message) => {
  if (message.channel.type === "dm") return;

  if (message.author.id === process.env.TLE_ID) {
    handleIdentify(bot, message);
    return;
  }

  const prefix = await getPrefix();
  if (!message.content.startsWith(prefix)) return;

  const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/\r\n|\r|\n| +/); // removes any whitespace in the message
  const command = args.shift().toLowerCase();

  if (message.channel.id === process.env.VERIFY_CHANNEL_ID) {
    if (command === `${prefix}verify`) {
      try {
        await verify(bot, message.author, prefix);
      } catch (error) {
        bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
      }
    }
    if (command !== `${prefix}clearchannel`) return;
  }

  // If a command is not present, log the default message
  if (!bot.commands.has(command)) {
    bot.commands.get("invalid").execute(message, args, prefix);
    return;
  }

  if (bot.commands.get(command).permission === "*") {
    const admin = await hasRole(bot, message.author.id, "Admin");
    if (admin === false) {
      message.reply("you do not have permission to run this command.");
      return;
    }
  }

  // otherwise execute that command
  try {
    await bot.commands.get(command).execute(message, args, prefix);
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
    message.reply("There was some error in executing that command! 🙁");
  }
});

bot.login(process.env.BOT_TOKEN);

// web server
const http = require("http");
const captchapng = require("captchapng");
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});
server.listen(3000);
