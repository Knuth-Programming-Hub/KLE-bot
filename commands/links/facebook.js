const Discord = require('discord.js');

module.exports = {
    name: '!facebook',
    description: 'Facebook Group',
    usage: ' ```!facebook\n\nType the command to get the link to the Facebook Group.```',
    execute(message, args) {
        const facebook = new Discord.MessageEmbed().setTitle('Join us on Facebook').setURL('https://www.facebook.com/groups/jiit.knuth');
        message.channel.send(facebook);
    },
};