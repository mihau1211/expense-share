require('./db/mongoose')
import express from 'express'
import userRouter from './routers/user'
import expenseRouter from './routers/expense';

const apiV1Prefix = '/api/v1/'

const app = express()

app.use(express.json());
app.use(apiV1Prefix, userRouter)
app.use(apiV1Prefix, expenseRouter)

app.use(express.json())

export default app