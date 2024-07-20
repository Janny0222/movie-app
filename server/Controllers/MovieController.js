import asyncHandler from "express-async-handler";
import { MoviesData } from "../Data/MovieData.js";
import Movie from "../Models/MovieModel.js";


// ****** PUBLIC CONTROLLERS ******
// import movies
// route POST /api/movies/import
// public access
const importMovies = asyncHandler(async (req, res) => {
    // we make sure our database is empty by deleting all movies
    await Movie.deleteMany({})
    // inserted list of movies from MoviesData
    const movies = await Movie.insertMany(MoviesData)
    res.status(201).json(movies)
})

// get all movies
// route GET /api/movies
// public access
const getMovies = asyncHandler(async (req, res) => {
    try {
        // filter movies by category, time, language, rate, year and search
        const { category, time, language, rate, year, search } = req.query
        let query = {
            ...(category && { category }),
            ...(time && { time }),
            ...(language && { language }),
            ...(rate && { rate }),
            ...(year && { year }),
            ...(search && {name:  {$regex: search, $options: "i"}})
        }
        // load more movies functionality
        const page = Number(req.query.pageNumber) || 1
        const limit = 2;
        const skip = (page - 1) * limit;

        // find movies by query, skip and limit
        const movies = await Movie.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        
        // get total number of movies
        const count = await Movie.countDocuments(query)

        // send response with movies and total number of movies
        res.json({movies, page, total_pages: Math.ceil(count / limit), totalMovies: count})

    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// get movie by id
// route GET /api/movies/:id
// public access
const getMovieById = asyncHandler(async (req, res) => {
    try {
        // find movie by id in the database
        const movie = await Movie.findById(req.params.id)
        if(movie) {
            res.json(movie)
        } else {
            res.status(404)
            throw new Error(`Movie not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// get top rated movies
// router GET /api/movies/rated/top
// public access
const getTopRatedMovies = asyncHandler(async (req, res) => {
    try {
        const movies = await Movie.find({}).sort({rate: -1}).limit(10)
        res.json(movies)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// get random movies
// route GET /api/movies/random/all
// public access
const getRandomMovies = asyncHandler(async (req, res) => {
    try {
        const movies = await Movie.aggregate([
            { $sample: { size: 8 } }
        ])
        console.log(movies)
        res.json(movies)
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})


// ******* PRIVATE CONTROLLERS ********

// create movie review
// route POST /api/movies/:id/review
// private access
const createMovieReview = asyncHandler(async (req, res) => {
    const {rating, comment} = req.body
    try {
        // find the movie by id in database
        const movie = await Movie.findById(req.params.id)
        if(movie) {
            // check if the user already reviewd this movie
            const alreadyReviewed = movie.reviews.find((review) => review.userId.toString() === req.user._id.toString())
            
            if(alreadyReviewed) {
                res.status(400);
                throw new Error('You already reviewed this movie')
            }
            const review = {
                userName: req.user.fullName,
                userId: req.user._id,
                userImage: req.user.image,
                rating: Number(rating),
                comment,
            }
            // push the new review in the reviews array
            movie.reviews.push(review)
            // increment the number of reviews
            movie.numberOfReviews = movie.reviews.length
            // calculate the new rate
            movie.rate = movie.reviews.reduce((acc, item) => item.rating + acc, 0) / movie.numberOfReviews
            // save the movie in the database
            await movie.save()
            res.status(201).json({message: 'Review added successfully'})
        }
        else {
            res.status(404)
            throw new Error(`Movie not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// ********* ADMIN CONTROLLERS *********

// udate movie
// route PUT /api/movies/:id
// private/admin access
const updateMovie = asyncHandler(async (req, res) => {
    try {
        const {name, desc, image, titleImage, rate, numberOfReviews, category, time, language, year, video, cast} = req.body

        const movie = await Movie.findById(req.params.id)

        if (movie) {
            movie.name = name || movie.name
            movie.desc = desc || movie.desc
            movie.image = image || movie.image
            movie.titleImage = titleImage || movie.titleImage
            movie.rate = rate || movie.rate
            movie.numberOfReviews = numberOfReviews || movie.numberOfReviews
            movie.category = category || movie.category
            movie.time = time || movie.time
            movie.language = language || movie.language
            movie.year = year || movie.year
            movie.video = video || movie.video
            movie.cast = cast || movie.cast

            // save the movie in the database
            const updatedMovie = await movie.save()

            // send the updated movie to the client
            res.status(201).json(updatedMovie)
        } else {
            res.status(404);
            throw new Error(`Movie not found`)
        }
        
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// delete specific movie
// route DELETE /api/movies/:id
// private/admin access
const deleteMovie = asyncHandler(async (req, res) => {
    try {
        // find movie in database
        const movie = await Movie.findById(req.params.id)

        // delete movie from database if exists
        if(movie) {
            await movie.deleteOne()
            res.json({message: 'Movie removed successfully'})
        } else {
        // send error if movie not found
            res.status(404)
            throw new Error(`Movie not found`)
        }
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// delete all movies
// route DELETE /api/movies
// private/admin access
const deleteAllMovies = asyncHandler(async (req, res) => {
    try {
        // delete all movies from database
        await Movie.deleteMany({})
        res.json({message: 'All movies removed successfully'})
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

// create movie
// route POST /api/movies
// private/admin access
const createMovie = asyncHandler(async (req, res) => {
    try {
        const {name, desc, image, titleImage, rate, numberOfReviews, category, time, language, year, video, cast} = req.body

        // create / post a new Movie
        const movie = new Movie({
            name,
            desc,
            image,
            titleImage,
            rate,
            numberOfReviews,
            category,
            time,
            language,
            year,
            video,
            cast,
            userId: req.user._id
        })
        if(movie) {
            // save the movie in the database
            const createdMovie = await movie.save()
            // send the created movie to the client
            res.status(201).json(createdMovie)
        } else {
            res.status(404)
            throw new Error(`Invalid movie data`)
        }
        
    } catch (error) {
        res.status(400).json({message: error.message})
    }
})

export { importMovies, getMovies, getMovieById, getTopRatedMovies, getRandomMovies, createMovieReview, updateMovie, deleteMovie, deleteAllMovies, createMovie }