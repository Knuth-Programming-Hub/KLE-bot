const Discord = require('discord.js');
const getFiles = require('../../getFiles');

module.exports = {
    name: '!help',
    description: 'List available commands',
    usage: '```!help\n\nuse !help to list all the commands\nuse !help <command-name> to get more details about the particular command```',
    execute: async (message, args) => {

        if(args.length >= 2) {
            message.channel.send('Wrong Format! Try !help help to know more.');
            return;
        }

        if(args.length === 1) {

            if(args[0] === 'help') {

                message.channel.send(
                ' ```!help\n\nuse !help to list all the commands\nuse !help <command-name> to get more details about the particular command```'
                );

                return;
            }

            let flag = 0;
            await getFiles('./commands')
            .then(files => {

                for(let file of files) {

                    let filePath = String(file);
                    filePath = '../../' + filePath.substring(filePath.lastIndexOf('commands\\'));
                    let fileName = filePath.substring(filePath.lastIndexOf('\\'));
                    fileName = fileName.substring(1,fileName.length-3).toLowerCase();
                    
                    if(args[0].toLowerCase() == fileName) {
                        const command = require(filePath);
                        message.channel.send(command.usage);
                        flag = 1;

                        return;
                    }
                }
            })
            .catch(err => console.log(err))

            if (!flag)
                message.channel.send("Command not found! Try !help to view the available commands.");
            
            return;
        }

        let commandFiles = [];
        await getFiles('./commands')
        .then(files => {

            for(let file of files) {

                let filePath = String(file);
                filePath = '../../' + filePath.substring(filePath.lastIndexOf('commands\\'));
                commandFiles.push(filePath);
            }
        })
        .catch(err => console.log(err))

        let commands = [];
        for (let filePath of commandFiles) {

            const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

            if(fileName === 'invalid.js')
                continue;
            
            if(fileName === 'help.js') {
                commands.push({name: '!help', value: 'List available commands', inline: false});
                continue;
            }

            const command = require(filePath);
            commands.push({name: `${command.name}${command.permission === undefined ? '' : command.permission}`, value: command.description, inline: false});
        }
    
        const commandsEmbedded = new Discord.MessageEmbed()
            .setTitle('Available commands')
            .addFields(commands);

        message.channel.send({
            embed: {
                ...commandsEmbedded,
                footer: {
                    text: '* - only for admins'
                }
            }
        });
    },
};