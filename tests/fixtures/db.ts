import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import User from '../../src/models/user'
import Expense from '../../src/models/expense'

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
            token: jwt.sign({ _id: user1Id }, secret)
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
            token: jwt.sign({ _id: user2Id }, secret)
        }
    ]
}

const expense1Id = new mongoose.Types.ObjectId
const expense1 = {
    _id: expense1Id,
    name: 'Holiday payments',
    isActive: true,
    owner: user1Id,
    users: [user1Id, user2Id]
}

const expense2Id = new mongoose.Types.ObjectId
const expense2 = {
    _id: expense1Id,
    name: 'Workout camp',
    isActive: true,
    owner: user1Id,
    users: [user1Id, user2Id]
}

const expense3Id = new mongoose.Types.ObjectId
const expense3 = {
    _id: expense1Id,
    name: 'Birthday present',
    isActive: true,
    owner: user2Id,
    users: [user2Id]
}

const expense4Id = new mongoose.Types.ObjectId
const expense4 = {
    _id: expense1Id,
    name: 'New Year party',
    isActive: false,
    owner: user2Id,
    users: [user1Id, user2Id]
}

const setupDb = async () => {
    await User.deleteMany()
    await Expense.deleteMany()

    await new User(user1).save()
    await new User(user2).save()

    await new Expense(expense1).save()
    await new Expense(expense2).save()
    await new Expense(expense3).save()
    await new Expense(expense4).save()
}

export {
    setupDb,
    user1,
    user2,
    user1Id,
    user2Id,
    expense1,
    expense1Id,
    expense2,
    expense2Id,
    expense3,
    expense3Id,
    expense4,
    expense4Id
}