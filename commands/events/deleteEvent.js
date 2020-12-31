const mongo = require('../../mongo');

const Event = require('../../models/event.model')

module.exports = {
    name: '!deleteevent',
    permission: '*',
    description: 'Delete an event',
    usage: ' ```!deleteevent\n\nPass the event S.No. according to !showevents to delete that particular event.```',
    execute: async (message, args) => {

        if (!message.member.hasPermission('ADMINISTRATOR')) {
            message.channel.send('You do not have permission to run this command.')
            return
        }

        if(args.length !== 1) {
            message.channel.send('Wrong format! Use !help deleteevent to know about usage.');
            return;
        }

        const index = parseInt(args[0]) - 1;

        await mongo().then(async mongoose => {
            try {

                await Event.find()
                .sort('date')
                .then(async response => {
                    const id = response[index]._id;
                    await Event.findByIdAndRemove(id)
                    .then(response => {
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