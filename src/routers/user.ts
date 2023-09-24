import express from 'express'
import User from '../models/user'
import auth from '../middleware/auth'
import multer from 'multer'
import sharp from 'sharp'

const router = express.Router()

router.get('/test', (req, res) => {
    res.send('testing of routing')
})

router.post('/users', async (req: any, res: any) => {
    const user = new User(req.body)
    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error: any) {
        res.status(400).send(error)
    }
})

router.post('/login', async (req: any, res: any) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token: string | undefined = await user?.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send()
    }
})

router.get('/users', auth, async (req: any, res: any) => {
    try {
        const users = await User.find()
        res.send(users)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req: any, res: any) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req: any, res: any) => {
    const allowedFields = ['name', 'password', 'isRemoved']
    const updateFields = Object.keys(req.body)
    const isAllowed = updateFields.every((update) => allowedFields.includes(update))

    if (!isAllowed) {
        res.status(400).send({ error: 'Request contains invalid fields.' })
    }

    try {
        updateFields.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (errpr) {
        res.status(400).send()
    }
})

export default router