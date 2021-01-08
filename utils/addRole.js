module.exports = (bot, discordUserId, roleName) => {
  bot.guilds
    .fetch(process.env.SERVER_GUILD_ID)
    .then((guild) => {
      guild.members
        .fetch(discordUserId)
        .then((member) => {
          const role = guild.roles.cache.find((role) => {
            return role.name === roleName;
          });
          member.roles.add(role);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};
