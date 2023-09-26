import request from 'supertest'
import app from '../src/app'
import User from '../src/models/user'
import Expense from '../src/models/expense'
import {
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
} from './fixtures/db'

const apiV1Prefix = '/api/v1/'

beforeEach(setupDb)

describe('Expense create and update test cases', () => {
    test('Should not create expense with no name provided', async () => {
        await request(app)
            .post('/expenses')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                owner: user1Id
            })
            .expect(400)
    })

    test('Should not create expense with no owner provided', async () => {
        await request(app)
            .post('/expenses')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Weeding gift'
            })
            .expect(400)
    })

    test('Should create a new expense', async () => {
        const response = await request(app)
            .post('/expenses')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Weeding gift',
                owner: user1Id
            })
            .expect(201)

        const expense = await Expense.findOne({
            name: 'Weeding gift',
            owner: response.body.expense._id
        })
        expect(expense?.owner).toBe(user1Id)
        expect(expense?.users[0].user).toBe(user1Id)
        expect(expense?.users[0]).toBe(user1Id)
    })

    test('Should not allow to update owner field', async () => {
        await request(app)
            .patch(`/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                owner: user2Id
            })
            .expect(400)

        const expense = await Expense.findById(expense1Id)
        expect(expense?.owner).toBe(user1Id)
    })

    test('Should not allow to update other user expense', async () => {
        await request(app)
            .patch(`/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                name: 'It is mine now'
            })
            .expect(401)

        const expense = await Expense.findById(expense1Id)
        expect(expense?.name).not.toBe('It is mine, now')
    })

    test('Should allow to update user expense', async () => {
        const response = await request(app)
            .patch(`/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Honeymoon'
            })
            .expect(200)
        
        const expense = await Expense.findById(response.body.expense._id)
        expect(expense?.name).toBe('Honeymoon')
    })

    test('Should allow to add new user to expense', async () => {
        const response = await request(app)
            .patch(`/expenses/${expense3Id}`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                user: user1Id
            })
            .expect(200)
        
        const expense = await Expense.findById(response.body.expense._id)
        expect(expense?.users[1].user).toBe(user1Id)
    })
})

describe('Expense get test cases', async () => {
    test('Should return all inactive expenses that user owns', async () => {
        const response = await request(app)
            .get('/expenses/me/own/inactive')
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(1)
    })

    test('Should return all active expenses that user owns', async () => {
        const response = await request(app)
            .get('/expenses/me/own/active')
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(1)
    })

    test('Should return all expenses that user owns', async () => {
        const response = await request(app)
            .get('/expenses/me/own')
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(2)
    })

    test('Should return all active expenses to which user have access', async () => {
        const response = await request(app)
            .get('/expenses/me/active')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(2)
    })

    test('Should return all inactive expenses to which user have access', async () => {
        const response = await request(app)
            .get('/expenses/me/inactive')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(1)
    })

    test('Should return all expenses to which user have access', async () => {
        const response = await request(app)
            .get('/expenses/me')
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.expense.length).toBe(3)
    })
})