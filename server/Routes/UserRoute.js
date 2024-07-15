import { Router } from 'express'
import { 
    registerUser, 
    loginUser, 
    updateUser, 
    deleteUser,
    changePassword,
    getFavoriteMovies,
    addFavoriteMovie,
    removeFavoriteMovie,
    getUsers,
    deleteUserProfile
} from '../Controllers/UserController.js'
import { admin, protect } from '../middlewares/Auth.js'

const router = Router()

// Public Routes
router.post('/register', registerUser)
router.post('/login', loginUser)

// Private Routes by using 'protect' middleware
router.put('/', protect, updateUser)
router.delete('/', protect, deleteUserProfile)
router.put('/password/:id', protect, changePassword)
router.get('/favorites', protect, getFavoriteMovies)
router.post('/favorites', protect, addFavoriteMovie)
router.delete('/favorites', protect, removeFavoriteMovie)

// Admin routes
router.get('/', protect, admin, getUsers)
router.delete('/:id', protect, admin, deleteUser)


export default router