const fs = require("fs");
const ReadableData = require("stream").Readable;
const captchapng = require("captchapng");
const Discord = require("discord.js");
const { addRole } = require("./guildMemberHandlers");

const getCaptcha = () => {
  const c = parseInt(Math.random() * 9999 + 100000);
  let p = new captchapng(80, 30, c);
  p.color(0, 0, 0, 0);
  p.color(80, 80, 80, 255);
  const base64 = p.getBase64();
  const imageBufferData = Buffer.from(base64, "base64");
  let streamObj = new ReadableData();
  streamObj.push(imageBufferData);
  streamObj.push(null);
  streamObj.pipe(fs.createWriteStream("captcha.png"));
  return c;
};

const filter = (m) => m.content.startsWith("/");

const sendCaptcha = async (bot, discordUser) => {
  const captcha = getCaptcha();
  const dmChannel = await discordUser.createDM();
  const attachment = new Discord.MessageAttachment(
    "captcha.png",
    "captcha.png"
  );
  let embed = new Discord.MessageEmbed()
    .setTitle(`Solve the below captcha to access the server! `)
    .setDescription(
      `Reply with the captcha seen in the image with prefix '/'.\nExample: if the captcha is 123456, send /123456\nYou will only get a minute to enter the captcha.`
    )
    .attachFiles(attachment)
    .setImage("attachment://captcha.png");
  dmChannel.send(embed).then(async () => {
    fs.unlink("captcha.png", (err) => {
      if (err) throw err;
    });
    await dmChannel
      .awaitMessages(filter, {
        max: 1,
        time: 60000,
        errors: ["time"],
      })
      .then((message) => {
        // User should now reply with captcha
        message = message.first();
        const recvCaptcha = message.content.substring(1);
        if (String(recvCaptcha) !== String(captcha)) {
          dmChannel.send(
            "Wrong Captcha! Leave the server and join back again..."
          );
          return false;
        }
        try {
          addRole(bot, discordUser, "Member");
        } catch (error) {
          bot.channels.cache
            .get(process.env.ERROR_LOG_CHANNEL)
            .send(error.stack);
          return false;
        }
        dmChannel.send("Welcome to the KPH Discord server! 🎉");
        return true;
      })
      .catch(() => {
        discordUser.send("Time's up! Leave the server and join back again...");
        return false;
      });
  });
};

module.exports = {
  sendCaptcha,
};
