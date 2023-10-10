import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './user'

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

interface IExpense extends mongoose.Document {
    name: string
    isActive: Boolean
    owner: mongoose.Schema.Types.ObjectId
    users: mongoose.Schema.Types.ObjectId[];
    toJson(): any
}

const expenseSchema = new mongoose.Schema<IExpense>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        trim: true,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }]
}, {
    timestamps: true
})

expenseSchema.virtual('transactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'expense'
});

const Expense = mongoose.model<IExpense>('Expense', expenseSchema)

export default Expense