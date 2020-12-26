const Discord = require('discord.js');

module.exports = {
    name: '!facebook',
    description: 'Facebook Group',
    execute(message, args) {
        const facebook = new Discord.MessageEmbed().setTitle('Follow us on Facebook').setURL('https://www.facebook.com/groups/jiit.knuth');
        message.channel.send(facebook);
    },
};