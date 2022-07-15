const mongoose = require('mongoose')
const Schema = mongoose.Schema

const queuedSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        task_queued: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
        }]
    }
)

module.exports = mongoose.model('queued', queuedSchema)