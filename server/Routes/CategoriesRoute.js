import { Router } from 'express'
import { admin, protect } from '../middlewares/Auth.js'
import * as categoriesController from '../Controllers/CategoriesController.js'

const router = Router()

// ******** Public Route ********
router.get('/', categoriesController.getCategories)

// ******** Admin Route ********
router.post('/', protect, admin, categoriesController.createCategory)
router.put('/:id', protect, admin, categoriesController.updateCategory)
router.delete('/:id', protect, admin, categoriesController.deleteCategory)

export default router