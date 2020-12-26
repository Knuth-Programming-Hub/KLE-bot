const fs = require('fs');

const Discord = require('discord.js');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

let commands = [];
for (const file of commandFiles) {

    if(`${file}` === 'invalid.js')
        continue;
    
    if(`${file}` === 'help.js')
    {
        commands.push({name: '!help', value: 'List available commands', inline: false});
        continue;
    }

    const command = require(`./${file}`);
    commands.push({name: command.name, value: command.description, inline: false});
}

module.exports = {
    name: '!help',
    description: 'List available commands',
    execute(message, args) {
        
        const commandEmbedded = new Discord.MessageEmbed()
            .setTitle('Available commands')
            .addFields(commands)

        message.channel.send(commandEmbedded);
    },
};