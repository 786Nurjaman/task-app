const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { ObjectID } = require('mongodb')
const { generateRandomCode } = require('../utils/helper')
const User = require('../models/user.model')


const register = async (req, res) => {
    const regUser = await User.findOne({ $or: [{ email: req.body.email }, { mobile: req.body.mobile }] })
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            console.log(err)
        }
        let user = new User({
            email: req.body.email,
            name: req.body.name.trim(),
            mobile: req.body.mobile,
            username: req.body.name.slice(0, 3) + generateRandomCode(),
            password: hash
        })
        if (regUser) {
            return res.status(500).json({
                message: "USER_ALREADY_EXIST",
                success: false
            })
        } else {
            user.save().then(result => {
                return res.status(200).json({
                    message: "USER_SUCCESSFULLY_CREATED",
                    success: true,
                    result
                })
            }).catch(err => {
                return res.status(500).json({
                    message: "ERROR_IN_CREATE_USER",
                    success: false
                })
            })
        }
    })
}

const login = (req, res) => {
    let { email, password } = req.body
    User.findOne({ email }).then(result => {
        if (result) {
            bcrypt.compare(password, result.password, (err, data) => {
                if (err) {
                    console.log(err)
                    return res.status(500).json({
                        message: "ERROR_IN_LOGIN",
                        success: false
                    })
                }
                if (data) {
                    let token = jwt.sign({ email: result.email, _id: result._id }, 'ABCD', { expiresIn: '2h' })
                    res.status(200).json({
                        message: 'SUCCESSFULLY_LOGIN',
                        success: true,
                        token
                    })
                } else {
                    res.status(500).json({
                        message: "LOGIN_FAILED",
                        success: false
                    })
                }
            })
        } else {
           return res.status(500).json({
                message: 'USER_NOT_FOUND',
                success: false
            })
        }
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            message: "ERROR_IN_LOGIN",
            success: false
        })
    })
}


const update = (req, res) => {
    let query = {
        _id: new ObjectID(req.userId)
    }
    let userData = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        mobile: req.body.mobile
    }
    User.findByIdAndUpdate(query, { $set: userData }, { new: true }).then(result => {
       return res.status(200).json({
            message: "SUCCESSFULLY_UPDATED",
            success: true,
           data: {
               name: result.name,
               username: result.username,
               email: result.email,
               mobile: result.mobile 
            }
        })
    }).catch(err => {
        console.log(err)
        return res.status(500).json({
            message: "ERROR_IN_USER_UPDATED",
            success: false
        })
    })
}


module.exports = {
    register,
    update,
    login
}