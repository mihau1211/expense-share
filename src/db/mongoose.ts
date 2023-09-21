import dotenv from 'dotenv'
import path from 'path'
import mongoose from 'mongoose'

const envPath = path.join(__dirname, '../../config/dev.env')
dotenv.config({ path: envPath })

if (typeof process.env.MONGODB_URL === 'string') {
    mongoose.connect(process.env.MONGODB_URL, {})
} else {
    console.error('ERROR: MONGODB_URL is not string type!')
}