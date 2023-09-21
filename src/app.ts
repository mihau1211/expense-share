require('./db/mongoose')

import express from 'express'
import User from './models/user'

const app = express()

app.use(express.json());

app.post('/users', async (req: any, res: any) => {

    console.log(req.body)
    const user = new User(req.body);
    try {
        await user.save()
        res.status(201).send(user)
    } catch (error:any) {
        res.status(400).send({error: error.message})
    }
})

app.use(express.json())

export default app