const mongoose = require('mongoose')
const Schema = mongoose.Schema

const queuedSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        task_queued: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "task",
        }]
    }
)

module.exports = mongoose.model('queued', queuedSchema)