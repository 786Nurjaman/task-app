
const moment = require('moment')
const taskDetails = require('../models/form.model')
const queuedDetails = require('../models/queued.model')
const cron = require('node-cron');

const generateRandomCode = () => Math.floor(100000 + Math.random() * 900000)

cron.schedule('55 23 * * *', async (req,res) => {
    const allTask = await taskDetails.find({}).exec()
    allTask.map(async (ele) => {
        let query = {
            _id: ele._id
        }
        let today = moment().format('YYYY-MM-DD')
        let finishDate = ele.finished_at.split('-').reverse().join('-')
        let diffInDays = moment(finishDate).diff(moment(today), 'days')
        if (diffInDays === 0) {
            const queuedData = await queuedDetails.findOne({ "user": ele.user })
            if (queuedData.task_queued.length === 1) {
                await queuedDetails.findOneAndRemove({ "user": ele.user }).exec()
                await taskDetails.findOneAndRemove(query).then(async (result) => {
                    if (result) {
                        console.log("SUCCESSFULLY_DELETED")
                    } else {
                        console.log("ERROR_IN_DELETE")
                    }
                }).catch(err => {
                    console.log(err)
                })
            } else {
                await queuedDetails.updateOne({ "user": ele.user }, { $pull: { "task_queued": { $in: [query] } } }).exec()
                await taskDetails.findOneAndRemove(query).then(async (result) => {
                    if (result) {
                        console.log("SUCCESSFULLY_DELETED")
                    } else {
                        console.log("ERROR_IN_DELETE")
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        } else {
            console.log(`PLEASE_COMPLETE_THE_TASK_WITHIN ${diffInDays} days`)
        }
    })
})


module.exports = {
    generateRandomCode
}