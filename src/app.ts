require('./db/mongoose')
import express from 'express'
import User from './models/user'
import userRouter from './routers/user'

const app = express()

app.use(express.json());
app.use(userRouter)

app.use(express.json())

export default app