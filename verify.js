var otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");
const user = require("./utils/usersHandlers");
const { addRole, ban } = require("./utils/guildMemberHandlers");

const getInstructions = `**✨Hey! Welcome to the KPH server✨**

You will need to enter here your institute email-id so that we can verify you.
Enter the email-id with '/' as prefix.
For example: If your email-id is abcd@example.com, reply /abcd@example.com.
After verifying it, the bot will send an OTP to the given mail-id.

*You will only get 5 minutes to enter a valid institute email-id.*

**In case of any issues, seek help in the #admin-support channel on the server.**`;

const getOTPInstructions = `**OTP sent! Please check your email!**
Enter the OTP with '/' as prefix, 
e.g. if OTP is 123456, send /123456.

*OTP expires in 5 minutes.*`;

const sendMail = async (email) => {
  let mailTransporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_MAIL_ID,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  let OTP = otpGenerator.generate(6, {
    upperCase: false,
    specialChars: false,
  });

  let mailDetails = {
    from: process.env.SENDER_MAIL_ID,
    to: email,
    subject: "Knuth Programming Hub Discord Server - Verification",
    text: `This is your OTP for verification: "${OTP}".
Do not share this with anyone!
    
If you didn't request for it, then please ignore this mail.`,
  };

  await mailTransporter.sendMail(mailDetails).then(
    (data) => {},
    (err) => {
      console.log(err);
      OTP = null;
    }
  );

  return OTP;
};

const checkIfVerified = async (bot, discordUser) => {
  var flag = false;
  await bot.guilds
    .fetch(process.env.SERVER_GUILD_ID)
    .then((guild) => {
      guild.members
        .fetch(discordUser.id)
        .then((member) => {
          if (member.roles.cache.find((r) => r.name === "JIITian")) {
            flag = true;
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  return flag;
};

const validateEmail = (email) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validateCollegeEmail = (email) => {
  email = email.toLowerCase();
  const name = email.substring(0, email.lastIndexOf("@"));
  const domain = email.substring(email.lastIndexOf("@") + 1);
  let isnum = /^\d+$/.test(name); // Check if string is all numbers, to avoid faculties from joining server.
  let batch = "20" + name[0] + name[1];
  if (name[0] == "9" && name[1] == "9") {
    batch = batch = "20" + name[2] + name[3]; // Enroll of 128 guys start from 99.
  }
  batch = Number(batch);

  if (domain !== "mail.jiit.ac.in" || isnum === false) {
    return [false, "notJIIT"];
  } else {
    return [true, String(batch + 4)];
  }
};

const handleFail = async (bot, dmChannel, discordUserId) => {
  const failCount = await user.updateFailCount(discordUserId);
  await dmChannel.send(`*No. of attempts left: ${3 - failCount}*`);
  if (failCount >= 3) {
    user.remove(discordUserId);
    await dmChannel.send("You are banned from the server!!");
    ban(bot, discordUserId);
  }
};

const filter = (m) => m.content.startsWith("/");

module.exports = async (bot, discordUser) => {
  const dmChannel = await discordUser.createDM();
  const check = await checkIfVerified(bot, discordUser);

  if (check === true) {
    dmChannel.send("You have been already verified as JIITian.");
    return;
  }

  dmChannel.send(getInstructions).then(async () => {
    let flag = false;
    let batchTag = "";
    await dmChannel
      .awaitMessages(filter, {
        max: 1,
        time: 300000,
        errors: ["time"],
      })
      .then(async (message) => {
        message = message.first(); // User should now reply with email.
        const email = message.content.substring(1);
        if (validateEmail(email) === false) {
          flag = true;
          dmChannel.send(
            "Hmm, that doesn't look like an email address. Send !verify on the server to try again."
          );
          handleFail(bot, dmChannel, discordUser.id);
          return;
        }
        const [ch, batch] = validateCollegeEmail(email);
        batchTag = batch;
        if (ch === false) {
          flag = true;
          dmChannel.send(
            "Hmm, that doesn't look like a JIIT email address. Note that this verification is for **JIIT students** only. Send !verify on the server to try again."
          );
          handleFail(bot, dmChannel, discordUser.id);
          return;
        }

        sentOTP = await sendMail(email);
        if (sentOTP === null) {
          flag = true;
          dmChannel.send(
            "It seems that there was some error. Send !verify on the server to try again."
          );
          handleFail(bot, dmChannel, discordUser.id);
        }
      })
      .catch(() => {
        flag = true;
        discordUser.send("Time's up! Send !verify on the server to try again.");
        handleFail(bot, dmChannel, discordUser.id);
      });

    if (flag === true) {
      return;
    }

    dmChannel.send(getOTPInstructions).then(async () => {
      await dmChannel
        .awaitMessages(filter, {
          max: 1,
          time: 300000,
          errors: ["time"],
        })
        .then(async (message) => {
          message = message.first(); //User should now reply with the OTP
          let recvOTP = message.content.substring(1);
          if (String(sentOTP) !== String(recvOTP)) {
            flag = true;
            dmChannel.send(
              "Wrong OTP! Send !verify on the server to try again."
            );
            handleFail(bot, dmChannel, discordUser.id);
          } else {
            addRole(bot, discordUser, "JIITian");
            addRole(bot, discordUser, batchTag);
            dmChannel.send(
              "Yay! You have verified yourself as a JIITian and are now officially a member of the KPH Discord server! 🎉"
            );
          }
        })
        .catch(() => {
          flag = true;
          discordUser.send(
            "Time's up! Send !verify on the server to try again."
          );
          handleFail(bot, dmChannel, discordUser.id);
        });
    });
  });
};
