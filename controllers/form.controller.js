const { ObjectID } = require('mongodb')
const moment = require('moment')
const taskDetails = require('../models/form.model')
const queuedDetails = require('../models/queued.model')

const createTask = async (req, res) => {
    let query = {
        _id: new ObjectID(req.userId)
    }
    const task = await taskDetails.find({ user: query._id }).sort({ _id: -1 }).limit(1)
    if (task.length === 0) {
        let today = moment().format('YYYY-MM-DD')
        let str = today.split('-').reverse().join('')
        let fNumber = str.slice(0, 4) + str.slice(6)
        let fdata = `${fNumber}_0` + 1
        let taskData = new taskDetails({
            user: query._id,
            title: req.body.title.trim(),
            slug: req.body.title.trim().toUpperCase().split(' ').join('-'),
            form_number: fdata,
            description: req.body.description,
            finished_at: req.body.finished_at,
            created_at: today,
            updated_at: today
        })
        taskData.save().then(async (result) => {
            let jobQueue = await queuedDetails.findOne({ user: query._id })
            if (jobQueue === null) {
                let queuedJob = new queuedDetails({
                    user: result.user,
                    task_queued: [result._id]
                })
                await queuedJob.save()
            }
            return res.status(200).json({
                message: "SUCCESSFULLY_CREATED",
                success: true,
                result
            })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({
                message: "ERROR_IN_CREATE_TASK",
                success: false
            })
        })
    } else {
        let today = moment().format('YYYY-MM-DD')
        let last_task = parseInt(task[0].form_number.slice(8))
        let str = today.split('-').reverse().join('')
        let fNumber = str.slice(0, 4) + str.slice(6)
        let fdata = `${fNumber}_0` + (last_task + 1)
        let taskDataNew = new taskDetails({
            user: query._id,
            title: req.body.title.trim(),
            slug: req.body.title.trim().toUpperCase().split(' ').join('-'),
            form_number: fdata,
            description: req.body.description,
            finished_at: req.body.finished_at,
            created_at: today,
            updated_at: today
        })
        taskDataNew.save().then(async (result) => {
            let jobQueue = await queuedDetails.findOne({ user: query._id })
            let queuedJob = {
                task_queued: [...jobQueue.task_queued, result._id]
            }
            await queuedDetails.findOneAndUpdate({ _id: jobQueue._id }, { $set: queuedJob }, { new: true })
            return res.status(200).json({
                message: "SUCCESSFULLY_CREATED",
                success: true,
                result
            })
        }).catch(err => {
            console.log(err)
            return res.status(500).json({
                message: "ERROR_IN_CREATE_TASK",
                success: false
            })
        })
    }
}

const updateTask = async (req, res) => {
    let today = moment().format('YYYY-MM-DD')
    let query = {
        slug: req.params.slug
    }
    taskData = {
        title: req.body.title,
        slug: req.body.title.toUpperCase().split(' ').join('-'),
        description: req.body.description,
        finished_at: req.body.finished_at,
        updated_at: today
    }
    await taskDetails.findOneAndUpdate(query, { $set: taskData }, { new: true }).then(result => {
        if (result!==null) {
            return res.status(200).json({
                message: "SUCCESSFULLY_UPDATED",
                success: true,
                result
            })
        } else {
            return res.status(500).json({
                message: "TASK_NOT_UPDATED",
                success: false,
                result
            })
        }
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            message: "ERROR_IN_TASK_UPDATED",
            success: false
        })
    })
}


const getSingleTask = async (req, res) => {
    let today = moment().format('YYYY-MM-DD')
    let query = {
        slug: req.params.slug
    }
    const resultNew = await taskDetails.findOne(query).populate({ path: `user`, select: `name email username` }).exec()
    if (resultNew!==null) {
        const finishDate = resultNew.finished_at.split('-').reverse().join('-')
        const diffInDays = moment(finishDate).diff(moment(today), 'days');
        if (resultNew) {
            let result = {
                ...resultNew.toObject(),
                remaining_days: diffInDays
            }
            return res.status(200).json({
                message: "DATA_FOUND",
                success: true,
                result
            })
        } else {
            return res.status(500).json({
                message: "DATA_NOT_FOUND",
                success: false
            })
        }   
    } else {
        return res.status(500).json({
            message: "DATA_NOT_FOUND",
            success: false
        })
    }
}

const getAllTask = async (req, res) => {
    const resultNew = await taskDetails.find({ user: new ObjectID(req.userId) }).populate({path:`user`,select:`name email username`}).exec()
    if (resultNew.length > 0) {
        let result = []
        let today = moment().format('YYYY-MM-DD')
        resultNew.map(async (ele) => {
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
    } else {
        return res.status(500).json({
            message: "DATA_NOT_FOUND",
            success: false
        })
    }
}

const deleteTask = async (req, res) => {
    let query = {
        _id: req.params.id
    }
   const data = await taskDetails.findOne(query).exec()
    if (data) {
        const queuedData = await queuedDetails.findOne({ "user": req.userId })
        if (queuedData.task_queued.length === 1) {
            await queuedDetails.findOneAndRemove({ "user": req.userId }).exec()
            await taskDetails.findOneAndRemove(query).then(async (result) => {
                if (result) {
                    return res.status(200).json({
                        message: "TASK_DELETED",
                        success: true
                    })
                } else {
                    return res.status(500).json({
                        message: "TASK_NOT_DELETED",
                        success: false
                    })
                }
            }).catch(err => {
                return res.status(500).json({
                    message: "ERROR_IN_TASK_DELETE",
                    success: false
                })
            })
        } else {
            await queuedDetails.updateOne({ "user": req.userId }, { $pull: { "task_queued": { $in: [query] } } }).exec()
            await taskDetails.findOneAndRemove(query).then(async (result) => {
                if (result) {
                    return res.status(200).json({
                        message: "TASK_DELETED",
                        success: true
                    })
                } else {
                    return res.status(500).json({
                        message: "TASK_NOT_DELETED",
                        success: false
                    })
                }
            }).catch(err => {
                return res.status(500).json({
                    message: "ERROR_IN_TASK_DELETE",
                    success: false
                })
            })
        }
    } else {
        return res.status(500).json({
            message: "DATA_NOT_FOUND",
            success: false
        })
    }
    
}

module.exports = {
    createTask,
    updateTask,
    getSingleTask,
    getAllTask,
    deleteTask
}