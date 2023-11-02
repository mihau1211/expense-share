import mongoose from "mongoose"

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

interface ITransaction extends mongoose.Document {
    name: string
    owner: mongoose.Schema.Types.ObjectId
    expense: mongoose.Schema.Types.ObjectId
    users: mongoose.Schema.Types.ObjectId[]
    value: number
    description: string
    date: Date
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
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 300,
        default: ''
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    }
}, {
    timestamps: true
})

const Transaction = mongoose.model<ITransaction>('Expense', transactionSchema)

export default Transaction