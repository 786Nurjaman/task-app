const jwt = require('jsonwebtoken')

const authenticate = (req, res, next) => {
    if (!req.headers.authorization) {
       return res.status(500).json({
            message: "UNAUTHORIZED_REQUEST",
            success: false
        })
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        jwt.verify(token, 'ABCD', (err, decode) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'UNAUTHORIZED_REQUEST'
                })
            } else {
                req.userId = decode._id
            }
        })
        next()
    } catch (err) {
        console.log(err)
    }
}

module.exports = authenticate