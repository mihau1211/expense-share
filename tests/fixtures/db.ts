import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../../src/models/user'

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

const user1Id = new mongoose.Types.ObjectId
const user1 = {
    _id: user1Id,
    name: 'Bob',
    password: 'BobPwd1@',
    email: 'bob@gmail.com',
    tokens: [
        {
            token: jwt.sign({_id: user1Id}, secret)
        }
    ]
}

const user2Id = new mongoose.Types.ObjectId
const user2 = {
    _id: user2Id,
    name: 'John',
    password: 'JohnPwd1@',
    email: 'john@gmail.com',
    tokens: [
        {
            token: jwt.sign({_id: user2Id}, secret)
        }
    ]
}

const setupDb = async () => {
    await User.deleteMany({})
    

    await new User(user1).save()
    await new User(user2).save()
}

export {
    setupDb,
    user1,
    user2,
    user1Id,
    user2Id
}