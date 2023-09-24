import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from './user'
import Expense from './expense'

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

interface ITransaction extends mongoose.Document {
    name: string
    owner: mongoose.Schema.Types.ObjectId
    expense: mongoose.Schema.Types.ObjectId
    value: number,
    description: string
    toJson(): any
}

const transactionSchema = new mongoose.Schema<ITransaction>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    expense: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Expense'
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxlength: 300
    },
    value: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model<ITransaction>('Expense', transactionSchema)

export default Transaction