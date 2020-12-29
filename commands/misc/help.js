const Discord = require('discord.js');
const getFiles = require('../../getFiles');

module.exports = {
    name: '!help',
    description: 'List available commands',
    execute: async (message, args) => {

        let commandFiles = [];
        await getFiles('./commands')
        .then(files => {
            // console.log(files);

            for(let file of files)
            {
                let filePath = String(file);
                filePath = '../../' + filePath.substring(filePath.lastIndexOf('commands\\'));
                commandFiles.push(filePath);
            }

            // console.log("in help", commandFiles);
        })
        .catch(err => console.log(err))

        let commands = [];
        for (let filePath of commandFiles) {

            const fileName = filePath.substring(filePath.lastIndexOf('\\') + 1);

            if(fileName === 'invalid.js')
                continue;
            
            if(fileName === 'help.js')
            {
                commands.push({name: '!help', value: 'List available commands', inline: false});
                continue;
            }

            const command = require(filePath);
            commands.push({name: command.name, value: command.description, inline: false});
        }
    
        const commandEmbedded = new Discord.MessageEmbed()
            .setTitle('Available commands')
            .addFields(commands)

        message.channel.send(commandEmbedded);
    },
};