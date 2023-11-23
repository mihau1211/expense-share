import express from 'express'
import User from '../models/user'
import auth from '../middleware/auth'

const router = express.Router()

router.post('/users', async (req: any, res: any) => {
    try {
        if (!req.body || !req.body.name || !req.body.password || !req.body.email) throw new Error('Required body is missing or invalid')
        const user = new User(req.body)

        await user.save()
        const token = await user.generateAuthToken()

        res.status(201).send({ user, token })
    } catch (error: any) {
        res.status(400).send({ error: `User create: ${error.message}` })
    }
})

router.post('/login', async (req: any, res: any) => {
    try {
        if (!req.body || !req.body.password || !req.body.email) throw new Error('Required body is missing or invalid')

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token: string | undefined = await user?.generateAuthToken()

        res.send({ user, token })
    } catch (error: any) {
        res.status(400).send({ error: `User login: ${error.message}` })
    }
})

router.post('/logout', auth, async (req: any, res: any) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send({ message: 'User logged out successfully' });
    } catch (error: any) {
        res.status(500).send({ error: `Logout failed: ${error.message}` });
    }
});

router.get('/users', auth, async (req: any, res: any) => {
    try {
        const { email } = req.query
        let users;

        if (email) {
            users = await User.find({ email })
        } else {
            users = await User.find()
        }
        res.send(users)
    } catch (error: any) {
        res.status(400).send({ error: `User get: ${error.message}` })
    }
})

router.get('/users/email', async (req: any, res: any) => {
    try {
        const user = await User.find({ email: req.query.email })

        if (!user.length) return res.send({ isAvailable: true })

        res.send({ isAvailable: false })
    } catch (error: any) {
        res.status(400).send({ error: `User get: ${error.message}` })
    }
})

router.get('/users/me', auth, async (req: any, res: any) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req: any, res: any) => {
    const allowedFields = ['name', 'password']
    const updateFields = Object.keys(req.body)
    const isAllowed = updateFields.every((update) => allowedFields.includes(update))

    try {
        if (!updateFields.length) throw new Error('Required body is missing')
        if (!isAllowed) {
            throw new Error('Request contains invalid fields')
        }

        updateFields.forEach((update) => req.user[update] = req.body[update])

        await req.user.save()

        res.status(200).send(req.user)
    } catch (error: any) {
        res.status(400).send({ error: `User update: ${error.message}` })
    }
})

export default router