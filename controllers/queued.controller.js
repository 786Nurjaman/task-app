const { ObjectID } = require('mongodb')
const moment = require('moment')
const queuedDetails = require('../models/queued.model')


const getJobQueued = async (req, res) => {
    let query = {
    user: new ObjectID(req.userId)
    }
    const resultNew = await queuedDetails.findOne(query).populate({
        path: `user task_queued`,
        select: `name email username title slug form_number created_at finished_at updated_at description`
    }).exec()
    if (resultNew!==null) {
        let result = []
        let today = moment().format('YYYY-MM-DD')
        resultNew.task_queued.map(async (ele) => {
            let finishDate = ele.finished_at.split('-').reverse().join('-')
            let diffInDays = moment(finishDate).diff(moment(today), 'days')
            let newObj = {
                ...ele.toObject(),
                remaining_days: diffInDays
            }
            result.push(newObj)
        })
        return res.status(200).json({
            message: "DATA_FOUND",
            success: true,
            result
        })
    } {
        return res.status(500).json({
            message: "DATA_NOT_FOUND",
            success: false
        })
    }
}

module.exports = {
    getJobQueued
}