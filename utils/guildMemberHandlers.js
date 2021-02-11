const addRole = (bot, discordUserId, roleName) => {
  roleName = String(roleName);
  bot.guilds.fetch(process.env.SERVER_GUILD_ID).then((guild) => {
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
          guild.members.fetch(discordUserId).then((member) => {
            member.roles.add(role);
          });
        });
    else {
      guild.members.fetch(discordUserId).then((member) => {
        member.roles.add(roleObj);
      });
    }
  });
};

const hasRole = async (bot, discordUserId, roleName) => {
  roleName = String(roleName);
  let role;
  await bot.guilds.fetch(process.env.SERVER_GUILD_ID).then((guild) => {
    guild.members.fetch(discordUserId).then((member) => {
      role = member.roles.cache.find((role) => role.name === roleName);
    });
  });

  return role !== undefined;
};

const removeRole = (bot, discordUserId, roleName) => {
  roleName = String(roleName);
  bot.guilds.fetch(process.env.SERVER_GUILD_ID).then((guild) => {
    const roleObj = guild.roles.cache.find((role) => {
      return role.name === roleName;
    });
    guild.members.fetch(discordUserId).then((member) => {
      member.roles.remove(roleObj);
    });
  });
};

const ban = (bot, discordUserId) => {
  bot.guilds.fetch(process.env.SERVER_GUILD_ID).then((guild) => {
    guild.members.fetch(discordUserId).then((member) => {
      member.ban({
        days: 0,
        reason: "Failed the verification process 3 times.",
      });
    });
  });
};

module.exports = {
  addRole,
  hasRole,
  removeRole,
  ban,
};
