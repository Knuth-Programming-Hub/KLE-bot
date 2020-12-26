// console.log("Hello world");

require('dotenv').config();

const Discord = require('discord.js');

const bot = new Discord.Client();

bot.on('ready', () => {
    console.log('The KLE bot is online!');
})

bot.on('message', message => {
    // console.log(message);

    if(message.content === "Hi KLE!")
        message.reply(`Hello!`);
})

bot.login(process.env.BOT_TOKEN);