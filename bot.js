require('dotenv').config();

const fs = require('fs');

const Discord = require('discord.js');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.on('ready', () => {
    console.log('The KLE bot is online!');
})

bot.on('message', message => {

    const args = message.content.trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // If a command is not present , log the default message
    if (!bot.commands.has(command)) {
        if (command[0] === "!")
            bot.commands.get('!invalid').execute(message, args);
        return;
    }

    // otherwise execute that command
    try {
        bot.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }   
});

bot.login(process.env.BOT_TOKEN);