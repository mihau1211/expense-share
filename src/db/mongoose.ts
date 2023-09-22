import mongoose from 'mongoose'

if (typeof process.env.MONGODB_URL === 'string') {
    mongoose.connect(process.env.MONGODB_URL, {})
} else {
    console.error('ERROR: MONGODB_URL is not string type!')
}