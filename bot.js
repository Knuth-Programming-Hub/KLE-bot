require("dotenv").config();

const Discord = require("discord.js");
const getFiles = require("./getFiles");
const remind = require("./remind");
const verify = require("./verify");
const tleHandler = require("./utils/TLE");
const getPrefix = require("./utils/db/getCommandPrefix");
const reactionHandler = require("./utils/reactionHandler");
const user = require("./utils/db/discordMemberHandlers");
const { addRole } = require("./utils/guildMemberHandlers");

const bot = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
});
bot.commands = new Discord.Collection();

bot.on("guildMemberAdd", async (member) => {
  try {
    if (member.user.bot === true) return;

    const channel = member.guild.channels.cache.find(
      (ch) => ch.id === process.env.WELCOME_CHANNEL_ID
    );

    if (!channel) return;

    const prefix = await getPrefix();

    let name = member.user.username;
    let welcomeEmbed = new Discord.MessageEmbed()
      .setColor("#176ffc")
      .setTitle(`Yay! ${name} you made it to KPH Discord Server `)
      .setDescription(
        `
    I am KLE, a bot specially designed for this server!
    Head to <#${process.env.RULES_CHANNEL_ID}> to get the Member role.
    `
      )
      .setFooter(`Use ${prefix}help command to know more about me.`);
    channel.send(welcomeEmbed);

    const userObj = await user.existsInUsers(member.id);
    if (userObj !== null) {
      await user.updateIsMember(member.id, true);
      if (userObj.batch !== undefined) {
        addRole(bot, member.id, "JIITian");
        addRole(bot, member.id, userObj.batch);
      }
    }
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
  }
});

bot.on("guildMemberRemove", async (member) => {
  const userObj = await user.existsInUsers(member.id);
  if (userObj !== null) await user.updateIsMember(member.id, false);
});

bot.on("ready", () => {
  getFiles("./commands")
    .then((files) => {
      for (const file of files) {
        const command = require(file);
        bot.commands.set(command.name, command); // subcommands are included
      }
    })
    .catch((error) => {
      bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
    });
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
  try {
    if (message.channel.type === "dm") return;

    if (message.author.id === process.env.TLE_ID) {
      tleHandler(message);
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
      if (command === "verify") {
        try {
          await verify(bot, message.author, prefix);
        } catch (error) {
          bot.channels.cache
            .get(process.env.ERROR_LOG_CHANNEL)
            .send(error.stack);
        }
      }
      if (command !== "clearchannel") return;
    }

    // command is not present or it is a subcommand
    if (
      !bot.commands.has(command) ||
      bot.commands.get(command).parentName !== undefined
    ) {
      bot.commands.get("invalid").execute(bot, message, args, prefix);
      return;
    }

    // execute the command
    try {
      await bot.commands.get(command).execute(bot, message, args, prefix);
    } catch (error) {
      bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
      message.reply("There was some error in executing that command! 🙁");
    }
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
  }
});

bot.on("messageReactionAdd", async (reaction, discordUser) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  try {
    await reactionHandler(bot, reaction, discordUser, true);
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
  }
});

bot.on("messageReactionRemove", async (reaction, discordUser) => {
  if (reaction.message.partial) await reaction.message.fetch();
  if (reaction.partial) await reaction.fetch();

  try {
    await reactionHandler(bot, reaction, discordUser, false);
  } catch (error) {
    bot.channels.cache.get(process.env.ERROR_LOG_CHANNEL).send(error.stack);
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
