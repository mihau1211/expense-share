import express from 'express'
import User from '../models/user'
import auth from '../middleware/auth'
import multer from 'multer'
import sharp from 'sharp'
import env from '../utils/envLoader'

const router = express.Router()

router.get('/test', (req, res) => {
    res.send('testing of routing')
})

router.post('/users', async (req: any, res: any) => {
    const user = new User(req.body);
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error: any) {
        res.status(400).send(error)
    }
})


export default router