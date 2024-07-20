import { Router } from 'express'
import { admin, protect } from '../middlewares/Auth.js'
import * as movieController from '../Controllers/MovieController.js'

const router = Router()

// Public Routes
router.post('/import', movieController.importMovies)
router.get('/', movieController.getMovies)
router.get('/:id', movieController.getMovieById)
router.get('/rated/top', movieController.getTopRatedMovies)
router.get('/random/all', movieController.getRandomMovies)

// Private Routes by using 'protect' middleware
router.post('/:id/reviews', protect, movieController.createMovieReview)

// Admin routes
router.put('/:id', protect, admin, movieController.updateMovie )
router.delete('/:id', protect, admin, movieController.deleteMovie )
router.delete('/', protect, admin, movieController.deleteAllMovies )
router.post('/', protect, admin, movieController.createMovie )

export default router