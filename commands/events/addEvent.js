const mongo = require('../../mongo');

const Event = require('../../models/event.model')

const getDate = (date, time) => {
    
    const dateArr = date.split('-');
    dateArr[1] = String(parseInt(dateArr[1])-1);
    dateArr.reverse();
    const timeArr = time.split(':');

    // new Date(year, month, date, hours, minutes, seconds, ms)
    const res =  new Date(...dateArr, ...timeArr);
    return res;
}

const eventObj = {
    date: null,
    title: "",
    venue: ""
}

const compute = args => {

    if(args[0] !== 'date:' || args[2] !== 'time:' || args[4] !== 'title:')
        return false;

    eventObj.date = getDate(args[1], args[3]);

    eventObj.title = "";
    eventObj.venue = "";

    let flag = 0;
    for(let i = 5; i < args.length; i += 1)
    {
        if(!flag && args[i] === 'venue:')
        {
            flag = 1;
            continue;   
        }

        if (!flag)
        {
            if (eventObj.title.length)
                eventObj.title += ' ';

            eventObj.title += args[i];
        }
        else
            eventObj.venue += args[i];    
    }

    console.log(eventObj);

    return flag ? true : false;
}

module.exports = {
    name: '!addevent',
    description: 'Add an event',
    execute: async (message, args) => {

        console.log(args);

        if (!message.member.hasPermission('ADMINISTRATOR')) {
            message.channel.send('You do not have permission to run this command.')
            return
        }

        if (!compute(args)) {
            message.channel.send('Wrong format!');
            return;
        }
        
        let str = "";

        await mongo().then(async mongoose => {
            try {
                const event = new Event( eventObj );
            
                await event.save()
                    .then(doc => {
                        str = 'Event Successfully Added! 😀';
                        console.log(doc);
                    })
                    .catch(err => {
                        str = 'There was some error. 🙁';
                        console.log(err);
                    })
            } finally {
                mongoose.connection.close();
            }
        })

        message.channel.send(str);
    }
};