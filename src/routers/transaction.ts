import express from 'express'
import User from '../models/user'
import Expense from '../models/expense'
import Transaction from '../models/transaction'
import auth from '../middleware/auth'

const router = express.Router()

const sortTransactions = (transactions: any[], sortBy: string, order: string) => {
    return transactions.sort((a, b) => {
        if (typeof (a as any)[sortBy] === 'string') {
            return order === "asc"
                ? (a as any)[sortBy].localeCompare((b as any)[sortBy])
                : (b as any)[sortBy].localeCompare((a as any)[sortBy]);
        } else {
            return order === "asc"
                ? (a as any)[sortBy] - (b as any)[sortBy]
                : (b as any)[sortBy] - (a as any)[sortBy];
        }
    });
}

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

        for (let userId of req.body.users) {
            const user = await User.findById(userId)
            if (!user) return res.status(422).send({ error: `Transaction create: User with id: ${req.body.expense} not found` })
            if (!expense.users.includes(user._id) || expense.owner.toString() !== user._id) {
                return res.status(422).send({ error: `Transaction create: Unable to add User with id: ${user._id}. User is not part of Expense` })
            }
        }

        req.body.owner = req.user._id
        if (req.body.date) req.body.date = new Date(req.body.date)

        const transaction = new Transaction(req.body)
        await transaction.save()
        await transaction.populate('owner', '_id name email')
        await transaction.populate('expense', '_id name isActive')

        res.status(201).send({ transaction })
    } catch (error: any) {
        res.status(400).send({ error: `Transaction create: ${error.message}` })
    }
})

// GET /transactions/me
router.get('/transactions/me', auth, async (req: any, res: any) => {
    try {
        const { name, sortBy, order = "asc" } = req.query
        let query: any = { owner: req.user._id }

        if (name) {
            query.name = new RegExp(name, 'i')
        }

        let transactions = await Transaction.find(query)
            .populate('owner', '_id name email')
            .populate('expense', '_id name isActive')
            .populate({
                path: 'users',
                select: '_id name email'
            });

        if (sortBy) transactions = sortTransactions(transactions, sortBy, order)

        res.status(200).send(transactions)
    } catch (error: any) {
        res.status(400).send({ error: `Transaction get: ${error.message}` })
    }
})

// GET /transactions/me/:id
router.get('/transactions/me/:id', auth, async (req: any, res: any) => {
    const { id } = req.params
    try {
        const transaction = await Transaction.find({ _id: id, owner: req.user._id })
            .populate('owner', '_id name email')
            .populate('expense', '_id name isActive')
            .populate({
                path: 'users',
                select: '_id name email'
            });

        if (!transaction) return res.status(404).send({ error: `Transaction get by id: Transaction not found for user` })

        res.status(200).send(transaction)
    } catch (error: any) {
        res.status(400).send({ error: `Transaction get by id: ${error.message}` })
    }
})

// GET /transactions/me/:expenseId
router.get('/transactions/me/:expenseId', auth, async (req: any, res: any) => {
    const { expenseId } = req.params
    try {
        const expense = await Expense.findById(expenseId)

        if (!expense) return res.status(422).send({ error: `Transaction get by expense and owner: Expense with id: ${expenseId} not found` })
        if (expense.owner.toString() !== req.user._id.toString() && !expense.users.includes(req.user._id)) {
            return res.status(401).send({ error: `Transaction get by expense and owner: Unauthorized access to Expense` })
        }

        const { name, sortBy, order = "asc" } = req.query
        let query: any = { owner: req.user._id, expense: expenseId }

        if (name) {
            query.name = new RegExp(name, 'i')
        }

        let transactions = await Transaction.find(query)
            .populate('owner', '_id name email')
            .populate('expense', '_id name isActive')
            .populate({
                path: 'users',
                select: '_id name email'
            });

        if (sortBy) transactions = sortTransactions(transactions, sortBy, order)

        res.status(200).send(transactions)
    } catch (error: any) {
        res.status(400).send({ error: `Transaction get by expense and owner: ${error.message}` })
    }
})

// PATCH /transactions/me/:id
router.patch('/transactions/me/:id', auth, async (req: any, res: any) => {
    const { id } = req.params
    const allowedFields = ['name', 'description', 'value', 'date', 'users']
    const updateFields = Object.keys(req.body)
    try {
        if (!updateFields.length) throw new Error('Required body is missing')
        const isInvalidField = updateFields.some((field) => !allowedFields.includes(field))
        if (isInvalidField) throw new Error('Given fields are invalid')

        const transaction = await Transaction.findById(id)
        if (!transaction) return res.status(404).send({ error: 'Transaction update: Transaction not found' })
        if (transaction.owner !== req.user._id) return res.status(401).send({ error: 'Transaction update: Unauthorized access to Transaction resource' })

        if (req.body.users) {
            const expense = await Expense.findById(transaction.expense)
            if (!expense) return res.status(422).send({ error: `Transaction update: Transaction contains reference to Expense that does not exist` })
            for (let userId of req.body.users) {
                const user = await User.findById(userId)
                if (!user) return res.status(422).send({ error: `Transaction update: User with id: ${req.body.expense} not found` })
                if (!expense.users.includes(user._id) || expense.owner.toString() !== user._id) {
                    return res.status(422).send({ error: `Transaction update: Cannot modify Transaction with provided User whit id: ${user._id}` })
                }
            }
        }

        updateFields.forEach((update) => {
            (transaction as any)[update] = req.body[update]
        })

        await transaction.save()

        res.status(204).send()
    } catch (error: any) {
        res.status(400).send({ error: `Transaction update: ${error.message}` })
    }
})

export default router