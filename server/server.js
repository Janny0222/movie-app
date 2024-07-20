import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import {connDB} from './config/db.js';
import mongoose from 'mongoose';
import userRoute from './Routes/UserRoute.js';
import categoriesRoute from './Routes/CategoriesRoute.js';
import moviesRoute from './Routes/MoviesRoute.js';
import { errorHandler } from './middlewares/errorHandler.js';
import Uploadrouter from './Controllers/UploadFile.js';
// to get the env variable
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
connDB();


// Default Routes
app.get('/', (req, res) => {
    res.send('API is running')
})
// Other Routes
app.use('/api/users', userRoute)
app.use('/api/movies', moviesRoute)
app.use('/api/categories', categoriesRoute)
app.use('/api/upload', Uploadrouter)

// error handling middleware
app.use(errorHandler)
const PORT = process.env.PORT || 5000;

mongoose.connection.once('open', () => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})
