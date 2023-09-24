require('./db/mongoose')
import express from 'express'
import User from './models/user'
import userRouter from './routers/user'

const apiV1Prefix = '/api/v1/'

const app = express()

app.use(express.json());
app.use(apiV1Prefix, userRouter)

app.use(express.json())

export default app