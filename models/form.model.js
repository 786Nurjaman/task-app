const mongoose = require('mongoose')
const Schema = mongoose.Schema

const formSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        title: {
            type: String,
            required: true
        },
        slug: {
            type: String,
            required: true
        },
        form_number: {
            type: String,
            required: true
        },
        created_at: {
            type: String,
        },
        finished_at: {
            type: String,
            required: true
        },
        updated_at: {
            type: String
        },
        description: {
            type: String,
            required: true
        }
    }
)

module.exports = mongoose.model('task', formSchema, 'task')