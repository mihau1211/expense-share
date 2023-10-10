import express from 'express'
import User from '../models/user'
import Expense from '../models/expense'
import Transaction from '../models/transaction'
import auth from '../middleware/auth'

const router = express.Router()

// POST /transactions
router.post('/transactions', auth, async (req: any, res: any) => {
    try {
        if (!req.body || !req.body.name || !req.body.expense || req.body.value === undefined || req.body.value === null) {
            throw new Error('Required body is missing or invalid')
        }

        const expense = await Expense.findById(req.body.expense)
        if (!expense) return res.status(422).send({ error: `Transaction create: Expense with id: ${req.body.expense} not found` })
        if (expense.owner.toString() !== req.user._id.toString() && !expense.users.includes(req.user._id)) {
            return res.status(401).send({ error: `Transaction create: Unable to authorize access to Expense resource` })
        }
        req.body.owner = req.user._id
        if (req.body.date) req.body.date = new Date(req.body.date)

        const transaction = new Transaction(req.body)
        await transaction.save()
        
        res.status(201).send({ transaction })
    } catch (error: any) {
        res.status(400).send({ error: `Transaction create: ${error.message}` })
    }
})