import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '../utils/envLoader'

const secret = env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('Unable to generate token.')
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validation(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid!')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
})

interface IUser extends mongoose.Document {
    name: string
    password: string
    email: string
    tokens: { token: string }[]
}

userSchema.statics.findByCredentials = async (email: string, password: string): Promise<IUser> => {
    const user: IUser | null = await User.findOne({ email, password })

    if (!user) {
        throw new Error('Unable to login.')
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login.')
    }

    return user;
}

userSchema.methods.generateAuthToken = async function () {
    const user: any = this
    const token: string = jwt.sign({ _id: user._id.toString() }, secret)

    return token
}

userSchema.methods.toJson = function () {
    const user: any = this

    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens
}

userSchema.pre('save', async function (next: Function) {
    const user: IUser = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, secret)
    }

    next()
})

const User = mongoose.model('User', userSchema)

export default User