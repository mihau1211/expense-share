require('./db/mongoose')
import express from 'express'
import userRouter from './routers/user'
import expenseRouter from './routers/expense'
import transactionRouter from './routers/transaction'
import cors from 'cors';

const apiV1Prefix = '/api/v1/'

const app = express()

app.use(cors())
app.use(express.json());
app.use(apiV1Prefix, userRouter)
app.use(apiV1Prefix, expenseRouter)
app.use(apiV1Prefix, transactionRouter)

app.use(express.json())

export default app