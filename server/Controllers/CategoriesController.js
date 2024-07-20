import Categories from "../Models/CatergoriesModel.js";
import asyncHandler from 'express-async-handler';


// ****** PUBLIC CONTROLLERS ******
// get all categories
// route GET /api/categories
// public access
const getCategories = asyncHandler(async (req, res) => {
   try {
    // find all categories in database
    const categories = await Categories.find({})

    // send all categories to the client
    res.json(categories)
   } catch (error) {
    res.status(400).json({message: error.message})
   }
})

// ****** ADMIN CONTROLLERS ******

// create new category
// route POST /api/categories
// private/admin access
 const createCategory = asyncHandler(async (req, res) => {
     try {
        // get title from request body
        const {title} = req.body
        // create new category
        const category = await Categories.create({
            title,
        }) 
        // save the new category to the client
        res.status(201).json(category)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
 })

 // update category
 // route PUT /api/categories/:id
 // private/admin access
 const updateCategory = asyncHandler(async (req, res) => {
    try {
        // get category from database
        const category = await Categories.findById(req.params.id)
        if(category) {
            // update category
            category.title = req.body.title || category.title
            const updatedCategory = await category.save()
            // send updated category to the client
            res.json(updatedCategory)
        } else {
            res.status(404)
            throw new Error('Category not found')
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
 })

 // delete category
 // route DELETE /api/categories/:id
 // private/admin access
 const deleteCategory = asyncHandler(async (req, res) => {
    try {
        // find category in database
        const category = await Categories.findById(req.params.id)
        if(category) {
            // delete category from database
            await category.deleteOne()
            res.json({message: 'Category removed successfully'})
        } else {
            res.status(404)
            throw new Error('Category not found')
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
 })

export { getCategories, createCategory, updateCategory, deleteCategory }