var otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");
const addRole = require("./utils/addRole");

const getInstructions = `**✨Hey! Welcome to the KPH server✨**
    You will need to enter your institute mail ID so that we can verify you.
    Reply to this text with your email ID with '/' as prefix.
    
    e.g. If you email is abcd@example.com, reply /abcd@example.com.
    You will receive an OTP on the given mail ID.`;
const getOTPInstructions = `**Check your email**
    Enter the OTP, with '/' as prefix, 
    e.g. if OTP is 123456, send /123456.`;

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
    text: `This is your OTP for verification: "${OTP}". Do not share this with anyone!`,
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
            console.log("Already a verified member.");
            flag = true;
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
  return flag;
};

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const filter = (m) => m.content.startsWith("/");

module.exports = async (bot, discordUser) => {
  const dmChannel = await discordUser.createDM();
  const check = await checkIfVerified(bot, discordUser);
  if (check === false) {
    dmChannel.send(getInstructions).then(async () => {
      let flag = false;
      await dmChannel
        .awaitMessages(filter, {
          max: 1,
          time: 100000,
          errors: ["time"],
        })
        .then(async (message) => {
          message = message.first(); // User will reply with email.
          const email = message.content.substring(1);
          if (validateEmail(email) === false) {
            flag = true;
            dmChannel.send(
              "Hmm, that doesn't look like an email address, maybe try again, send !verify on the server again."
            );
            return;
          }
          // TODO: verify it is a college email.
          sentOTP = await sendMail(email);
          console.log("Sent OTP:", sentOTP);
          if (sentOTP === null) {
            flag = true;
            dmChannel.send(
              "It seems there was some error. Please try again after some time."
            );
            return;
          }
        })
        .catch(() => {
          flag = true;
          discordUser.send("Timeout");
        });

      if (flag === true) {
        return;
      }

      dmChannel.send(getOTPInstructions).then(async () => {
        await dmChannel
          .awaitMessages(filter, {
            max: 1,
            time: 100000,
            errors: ["time"],
          })
          .then(async (message) => {
            message = message.first(); //User should reply with the OTP
            let recvOTP = message.content.substring(1);
            console.log("Recieved OTP:", recvOTP);
            if (String(sentOTP) !== String(recvOTP)) {
              flag = true;
              dmChannel.send(
                "Wrong OTP! Please try again after some time." // Can also mute for some time maybe.
              );
              return;
            } else {
              addRole(bot, discordUser, "JIITian");
              console.log("Verfied.");
              dmChannel.send(
                "Yay! You have verified yourself as a JIITian and are now officially a member of the KPH Discord server! 🎉\n"
              );
              return;
            }
          })
          .catch(() => {
            flag = true;
            discordUser.send("Timeout");
          });
      });
    });
  } else {
    dmChannel.send("You have been already verified as JIITian.");
  }
};
