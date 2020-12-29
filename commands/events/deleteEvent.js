const mongo = require('../../mongo');

const Event = require('../../models/event.model')

module.exports = {
    name: '!deletevent',
    description: 'Delete an event',
    execute: async (message, args) => {

        const index = parseInt(args[0]) - 1;

        await mongo().then(async mongoose => {
            try {

                await Event.find()
                .sort('date')
                .then(async response => {
                    console.log(response[index]);
                    
                    const id = response[index]._id;
                    await Event.findByIdAndRemove(id)
                    .then(response => {
                        console.log(response);
                        message.channel.send("Event deleted successfully! 🔥");
                    })
                    .catch(err => {
                        console.log(err);
                        message.channel.send('There was some error in deleting the event. 🙁');
                    })
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