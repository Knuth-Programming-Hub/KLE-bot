require('dotenv').config();

const Discord = require('discord.js');

const bot = new Discord.Client();
bot.commands = new Discord.Collection();

const getFiles = require('./getFiles');

let commandFiles = [];

bot.on('ready', async () => {
    console.log('The KLE bot is online!');

    await getFiles('./commands')
        .then(files => {
            for (let file of files) {
                let filePath = String(file);
                filePath = './' + filePath.substring(filePath.lastIndexOf('commands\\'));
                commandFiles.push(filePath);
            }

            for (const filePath of commandFiles) {
                const command = require(filePath);
                bot.commands.set(command.name, command);
            }
        })
        .catch(err => console.log(err))
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