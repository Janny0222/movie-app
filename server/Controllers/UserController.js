import User from "../Models/UserModel.js";
import asyncHandler from 'express-async-handler'
import bcrypt from 'bcryptjs'
import { generateToken } from "../middlewares/Auth.js";

// ******** LOCAL CONTROLLER ********
//  Register User
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, password, image } = req.body

    if(!fullName || !email || !password) {
        return res.status(400).json({'message': `Missing fields`})
    }
    const userExists = await User.findOne({email})
    // check if user exists
    if(userExists) {
        res.status(400)
        throw new Error(`User already exists`)
    }
    try {
        // hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        // creating user in DB
        let new_user = await User.create({
           "fullName": fullName,
           "email": email,
           "password": hashedPassword,
           "image": image
        })
        // If successfully created, send user details and token to Client-side
        if(new_user) {
            res.status(201).json({
                _id: new_user._id,
                fullName: new_user.fullName,
                email: new_user.email,
                image: new_user.image,
                isAdmin: new_user.isAdmin,
                token: generateToken(new_user._id)
            })
        } else {
            res.status(400)
            throw new Error(`Invalid user data`)
        }        
    } catch (error) {
        console.log(`Encounter error: `, error)
        console.error(error)
    }
})

//  Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if((email || password) === '' || undefined) {
        res.status(400)
        throw new Error(`Missing fields`)
    }
    try {
        // find user in DB
        const user = await User.findOne({ email: email })
        
        const check_password = await bcrypt.compare(password, user.password)
        
        if(!check_password) {
            res.status(400).json({message: `Password does not match`})
        }
        if(user && check_password) {
            // res.send(`Login Successful`)
            res.status(200).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                image: user.image,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            })
            
        } else {
            res.status(400)
            throw new Error(`Invalid credentials`)
        }
    } catch (error) {
        console.error(error)
    }
})

// ******* PRIVATE CONTROLLER *******
// route PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
    const {fullName, email, image} = req.body
    try {
        // find user in DB
        const user = await User.findById(req.user._id)
        if(user) {
            user.fullName = fullName || user.fullName
            user.email = email || user.email
            user.image = image || user.image
            const updatedUser = await user.save()
            res.json({
                _id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                image: updatedUser.image,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id)
            })
        } else {
            res.status(404)
            throw new Error(`User not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// change password
// route PUT /api/users/password/:id
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if((oldPassword || newPassword) === '' || undefined) {
        res.status(400)
        throw new Error(`Missing fields`)
    }
    try {
        // find user in DB
        const user = await User.findById(req.params.id)

        // check if password matches
        const check_password = await bcrypt.compare(oldPassword, user.password)
        
        if(user && check_password) {
            // hashed new password
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(newPassword, salt)
            user.password = hashedPassword
            // validating if the current password and new password has the same value
            if(newPassword === oldPassword) {
                res.status(400).json({message: `New password cannot be same as old password`})
            } else {
                // saving new password
                await user.save()
                res.status(200).json({message: `Password changed successfully`})
            }

            // incorrect old password
        } else {
            res.status(404)
            throw new Error(`Invalid old password`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// delete user profile
// route DELETE /api/users/
const deleteUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)
        console.log(user)
        if(user) {
            if(user.isAdmin) {
                res.status(400).json({message: `Admin cannot be deleted`})
            } else {
                res.json({message: 'User deleted successfully'})
            }
            
        }
        else {
            res.status(404)
            throw new Error('User not found')
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// get all liked movies
// route GET /api/users/favorites
const getFavoriteMovies = asyncHandler(async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("likedMovies")
        console.log(user)
        if(user) {
            res.json(user.likedMovies)
        } else {
            res.status(404)
            throw new Error(`User not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// add movie to liked movies
// route POST /api/users/favorites
const addFavoriteMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.body
    try{
        //find user in DB
        const user = await User.findById(req.user._id)
        // if user exists add movie to liked movies and save it in DB
        if(user) {
            //check if movie is already marked as favorite
            if(user.likedMovies.includes(movieId)) {
                res.status(400)
                throw new Error(`Movie already liked`)
            }
            // marked movies as favorite
            user.likedMovies.push(movieId)
            await user.save()
            res.json(user.likedMovies)
        } else {
            res.status(404)
            throw new Error(`Movie not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// remove movie from liked movies
// route DELETE /api/users/favorites
const removeFavoriteMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.body
    try{
        //find user in DB
        const user = await User.findById(req.user._id)
        // if user exists remove movie from liked movies and save it in DB
        if(user) {
            //check if movie is already marked as favorite
            user.likedMovies = []
            await user.save()
            
            res.json({message: 'All favorite movies removed successfully'})
        } else {
            res.status(404)
            throw new Error(`Movie not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})  
    }
})


// ******** ADMIN CONTROLLERS ********
// GET All User
// route GET /api/users
const getUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({})
        res.json(users)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

//  Delete User
// route DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    if(!req?.params?.id) {
        return res.status(400).json({
            'message' : 'User ID Missing'
        })
    }
    try {
        const user = await User.findById(req.params.id)
        if(user) {
            if(user.isAdmin) {
                res.status(404);
                throw new Error(`Can't delete admin user`)
            }
            await user.deleteOne()
            res.json({message: 'User deleted successfully'})
        } else {
            res.status(404)
            throw new Error(`User not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

export { registerUser, loginUser, deleteUserProfile, updateUser, deleteUser, changePassword, getFavoriteMovies, addFavoriteMovie, removeFavoriteMovie, getUsers }