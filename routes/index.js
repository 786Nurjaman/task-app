const express = require('express')
const authenticate = require('../utils/jwt')
const expressHealthCheck = require("express-healthcheck");
const router = express.Router()
const userController = require('../controllers/user.controller')
const formController = require('../controllers/form.controller')
const jobQueueController = require('../controllers/queued.controller')

//health-check
router.use("/up", expressHealthCheck({
    healthy: () =>
        `Hello !! everything is ok in backend API ${new Date().toISOString()}`,
}));

// Auth
router.post('/signup', userController.register)
router.post('/login', userController.login)
router.put('/update', authenticate, userController.update)

//Task
router.post('/task', authenticate, formController.createTask)
router.put('/task/update/:slug', authenticate, formController.updateTask)
router.get('/task/:slug', authenticate, formController.getSingleTask)
router.get('/tasks', authenticate, formController.getAllTask)
router.delete('/tasks/delete/:id', authenticate, formController.deleteTask)

// Job queued
router.get('/jobqueued', authenticate, jobQueueController.getJobQueued)


module.exports = router