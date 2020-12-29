const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        date: {type: Date, required: true},
        title: {type: String, required: true},
        venue: {type: String, required: true}
    },
    {
        timestamps: true,
        collection: 'events'
    }
)

module.exports = new mongoose.model('Event', eventSchema);