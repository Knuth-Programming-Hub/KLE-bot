const Discord = require('discord.js');
const mongo = require('../../mongo');

const Event = require('../../models/event.model')

const getDateAndTime = (dateObj) => {
    dateObj = dateObj.toString();
    const pos = dateObj.indexOf(':') - 2;
    return [dateObj.substring(4, pos), dateObj.substring(pos)];
}

const compute = (eventObjects) => {

    const events = [];
    for(let index in eventObjects)
    {
        const elem = eventObjects[index];

        index = String(parseInt(index)+1);
        const dateAndTime = getDateAndTime(elem.date);

        events.push({
            name: `${index}. ${elem.title}`, 
            value: 
            `**Date:** ${dateAndTime[0]}
             **Time:** ${dateAndTime[1]}  
             **Venue:** ${elem.venue}`,
            inline: false
        });
    }

    return events;
}

module.exports = {
    name: '!showevents',
    description: 'Show all events',
    execute: async (message, args) => {

        await mongo().then(async mongoose => {
            try {

                await Event.find()
                .sort('date')
                .then(response => {
                    
                    const events = compute(response);
                    
                    const eventsEmbedded = new Discord.MessageEmbed()
                                        .setTitle('All Events')
                                        .addFields(events);
                    
                    message.channel.send(eventsEmbedded);
                })
                .catch(err => {
                    console.log(err);
                    message.channel.send('There was some error. 🙁');
                });

            } finally {
                mongoose.connection.close();
            }
        })
    }
};