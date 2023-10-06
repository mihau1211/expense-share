import express from 'express'
import User from '../models/user'
import Expense from '../models/expense'
import auth from '../middleware/auth'

const router = express.Router()

// POST /expenses
router.post('/expenses', auth, async (req: any, res: any) => {
    try {
        if (!req.body || !req.body.name) throw new Error('Required body is missing or invalid')
        
        req.body.owner = req.user._id
        req.body.isActive = true
        
        if (req.body.users) {
            for (let userId of req.body.users) {
                let user = await User.findById(userId)
                if (!user) return res.status(422).send({ error: `Expense create: User with id: ${userId} not found` })
            }
        }

        const expense = new Expense(req.body);
        await expense.save()
        res.status(201).send({ expense })
    } catch (error: any) {
        res.status(400).send({ error: `Expense create: ${error.message}` })
    }
})

// GET /expenses/me/own
router.get('/expenses/me/own', auth, async (req: any, res: any) => {
    let query: any = {
        owner: req.user._id
    }

    if (req.query.isActive) query.isActive = (req.query.isActive === 'true')
    if (req.query.name) query.name = new RegExp(req.query.name, 'i')

    try {
        const expenses = await Expense.find(query)
            .populate('owner', '_id name email')
            .populate({
                path: 'users',
                select: '_id name email'
            });
        res.send(expenses)
    } catch (error: any) {
        res.status(400).send({ error: `Expense get: ${error.message}` })
    }
})

// GET /expenses/me
router.get('/expenses/me', auth, async (req: any, res: any) => {
    let query: any = {
        $or: [
            { owner: req.user._id },
            { users: req.user._id },
        ]
    }

    if (req.query.isActive) query.isActive = (req.query.isActive === 'true')
    if (req.query.name) query.name = new RegExp(req.query.name, 'i')

    try {
        const expenses = await Expense.find(query)
            .populate('owner', '_id name email')
            .populate({
                path: 'users',
                select: '_id name email'
            });
        res.send(expenses)
    } catch (error: any) {
        res.status(400).send({ error: `Expense get: ${error.message}` })
    }
})

// GET /expenses/:id
router.get('/expenses/:id', auth, async (req: any, res: any) => {
    const { id } = req.params
    try {
        const expense = await Expense.findById(id)

        if (!expense) return res.status(404).send({ error: 'Expense get by id: Expense not found' })
        if (expense.owner.toString() !== req.user._id.toString() && !expense.users.includes(req.user._id)) {
            return res.status(401).send({ error: 'Expense get by id: Unauthorized access to Expense resource' })
        }

        await expense.populate('owner', '_id name email')
        await expense.populate({
            path: 'users',
            select: '_id name email'
        });

        res.send(expense)
    } catch (error: any) {
        res.status(400).send({ error: `Expense get by id: ${error.message}` })
    }
})

// PATCH /expenses/:id/addUser
router.patch('/expenses/:id/addUser', auth, async (req: any, res: any) => {
    const { id } = req.params
    try {
        if (!req.body || !req.body.user) throw new Error('Required body is missing or invalid')

        const expense = await Expense.findById(id)
        if (!expense) return res.status(404).send({ error: 'Expense update: Expense not found' })
        if (expense.owner.toString() !== req.user._id.toString()) {
            return res.status(401).send({ error: 'Expense update: Unauthorized access to Expense resource' })
        }

        const user = await User.findById(req.body.user)
        if (!user) return res.status(422).send({ error: 'Expense update: User not found' })

        if (expense.users.includes(user._id)) {
            return res.status(422).send({ error: 'Expense update: Provided User is already part of Expense' })
        }

        expense.users.push(user._id)
        await expense.save()

        res.status(204).send()
    } catch (error: any) {
        res.status(400).send({ error: `Expense update: ${error.message}` })
    }
})

// PATCH /expenses/:id
router.patch('/expenses/:id', auth, async (req: any, res: any) => {
    const { id } = req.params
    const allowedFields = ['name', 'isActive']
    const updateFields = Object.keys(req.body)
    try {
        if (!updateFields.length) throw new Error('Required body is missing')
        const isInvalidField = updateFields.some((field) => !allowedFields.includes(field));
        if (isInvalidField) throw new Error('Given fields are invalid')

        const expense = await Expense.findById(id)
        if (!expense) return res.status(404).send({ error: 'Expense update: Expense not found' })
        if (expense.owner.toString() !== req.user._id.toString()) {
            return res.status(401).send({ error: 'Expense update: Unauthorized access to Expense resource' })
        }

        updateFields.forEach((update) => {
            (expense as any)[update] = req.body[update]
        })

        await expense.save()

        res.status(204).send()
    } catch (error: any) {
        res.status(400).send({ error: `Expense update: ${error.message}` })
    }
})

export default router