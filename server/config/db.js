// connect mongodb with mongoose

import mongoose from "mongoose";

export const connDB = async () => {
    try {
        const conn =await mongoose.connect(process.env.DATABASE_URI);
         console.log(`Successfully Connected`)
    } catch (err) {
        console.log('Unable to connect: ', err)
        console.error(err)
        process.exit(1)
    }
}

