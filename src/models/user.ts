import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '../utils/envLoader'

const secret = env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
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
        trim: true,
        minLength: 7,
        validate: {
            validator: (value: string) => {
                return validator.isStrongPassword(value)
            },
            message: 'Password is not strong enough.'
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: (value: string) => {
                return validator.isEmail(value);
            },
            message: 'Email is invalid.'
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
    name: string;
    password: string;
    email: string;
    tokens: { token: string }[];
    generateAuthToken(): Promise<string>;
    toJson(): any;
}

// Define IUserMethods interface for the User model
interface IUserMethods extends mongoose.Model<IUser> {
    findByCredentials(email: string, password: string): Promise<IUser | null>;
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

userSchema.methods.generateAuthToken = async function (): Promise<string> {
    const user: any = this
    const token: string = jwt.sign({ _id: user._id.toString() }, secret)

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token
}

userSchema.methods.toJson = function () {
    const user: any = this

    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

userSchema.pre('save', async function (next: Function) {
    const user: any = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model<IUser, IUserMethods>('User', userSchema)

export default User