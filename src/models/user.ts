import mongoose from "mongoose"
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

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

const userSchema = new mongoose.Schema<IUser, IUserMethods>({
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
        validate(value: string) {
            if (!validator.isStrongPassword(value)) {
                throw new Error('Password is not follow passwords policy.')
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid.');
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

userSchema.static('findByCredentials', async function findByCredentials(email: string, password: string): Promise<IUser> {
    const user: IUser | null = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login.')
    }

    const isMatch: boolean = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to login.')
    }

    return user;
})

userSchema.method('generateAuthToken', async function generateAuthToken(): Promise<string> {
    const user: any = this
    const token: string = jwt.sign({ _id: user._id.toString() }, secret, { expiresIn: '7 days' })

    user.tokens = user.tokens.concat({ token });
    await user.save();

    return token
})

userSchema.method('toJson', function toJson() {
    const user: any = this

    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
})

userSchema.pre('save', async function (next: Function) {
    const user: any = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model<IUser, IUserMethods>('User', userSchema)

export default User