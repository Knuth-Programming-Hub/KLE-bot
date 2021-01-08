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
    e.g. if OTP is 123456, send /123456.
    OTP expires in 5 minutes.`;

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

const filter = (m) => m.content.startsWith("/");

module.exports = async (bot, discordUser) => {
  const dmChannel = await discordUser.createDM();
  const check = await checkIfVerified(bot, discordUser);
  if (check === false) {
    dmChannel.send(getInstructions).then(async () => {
      let flag = false;
      let batchTag = "";
      await dmChannel
        .awaitMessages(filter, {
          max: 1,
          time: 100000,
          errors: ["time"],
        })
        .then(async (message) => {
          message = message.first(); // User should now reply with email.
          const email = message.content.substring(1);
          if (validateEmail(email) === false) {
            flag = true;
            dmChannel.send(
              "Hmm, that doesn't look like an email address, maybe try again, send !verify on the server again."
            );
            return;
          }
          const [ch, batch] = validateCollegeEmail(email);
          batchTag = batch;
          if (ch === false) {
            flag = true;
            dmChannel.send(
              "Hmm, that doesn't look like a JIIT email address, Note that this verification is for JIIT **students** only."
            );
            return;
          }

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
          discordUser.send("Timeout, try again after some time.");
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
            console.log("Recieved OTP:", recvOTP);
            if (String(sentOTP) !== String(recvOTP)) {
              flag = true;
              dmChannel.send("Wrong OTP! Please try again after some time.");
              return;
            } else {
              addRole(bot, discordUser, "JIITian");
              //TODO: automatic role creation.
              addRole(bot, discordUser, batchTag);
              console.log("Verfied.");
              dmChannel.send(
                "Yay! You have verified yourself as a JIITian and are now officially a member of the KPH Discord server! 🎉\n"
              );
              return;
            }
          })
          .catch(() => {
            flag = true;
            discordUser.send("Timeout, try again after some time.");
          });
      });
    });
  } else {
    dmChannel.send("You have been already verified as JIITian.");
  }
};
