const addRole = (bot, discordUserId, roleName) => {
  roleName = String(roleName);
  bot.guilds
    .fetch(process.env.SERVER_GUILD_ID)
    .then((guild) => {
      const roleObj = guild.roles.cache.find((role) => {
        return role.name === roleName;
      });

      if (roleObj === undefined)
        guild.roles
          .create({
            data: {
              name: roleName,
              color: "GREEN",
            },
            reason: "We need this role!",
          })
          .then((role) => {
            guild.members
              .fetch(discordUserId)
              .then((member) => {
                member.roles.add(role);
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      else {
        guild.members
          .fetch(discordUserId)
          .then((member) => {
            member.roles.add(roleObj);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
};

const ban = (bot, discordUserId) => {
  bot.guilds
    .fetch(process.env.SERVER_GUILD_ID)
    .then((guild) => {
      guild.members
        .fetch(discordUserId)
        .then((member) => {
          member
            .ban({
              days: 0,
              reason: "Failed the verification process 3 times.",
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const getBatch = async (bot, discordUserId) => {
  let batch = null;
  await bot.guilds
    .fetch(process.env.SERVER_GUILD_ID)
    .then((guild) => {
      guild.members
        .fetch(discordUserId)
        .then((member) => {
          const roles = member.roles.cache.array();
          for (let elem of roles) {
            if (elem.name.startsWith("20") === true) {
              batch = Number(elem.name);
              break;
            }
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  return batch;
};

module.exports = {
  addRole,
  ban,
  getBatch,
};
