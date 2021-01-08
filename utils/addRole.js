module.exports = (bot, discordUserId, roleName) => {
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
