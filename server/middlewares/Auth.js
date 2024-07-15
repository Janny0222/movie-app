// generate a token
// @desc Authenticated user & get token
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../Models/UserModel.js'

// Authenticated user and get token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

// protection middleware
const protect = asyncHandler(async (req, res, next) => {
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // set token from Bearer token in header
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await User.findById(decoded.id).select('-password')
            next()
        } catch (error) {
            res.status(401)
            throw new Error('Not authorized, token failed')
        }
    }

    // if no token
    if(!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

// admin middleware
const admin = asyncHandler(async (req, res, next) => {
    if(req.user && req.user.isAdmin) {
        next()
    } else {
        res.status(401)
        throw new Error('Not authorized as an admin')
    }
})

export { generateToken, protect, admin}