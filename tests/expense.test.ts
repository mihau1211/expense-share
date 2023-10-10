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

beforeEach(setupDb, 10000)

describe('Expense create and update test cases', () => {
    test('Should not create expense with wrong body provided', async () => {
        const response = await request(app)
            .post(`${apiV1Prefix}/expenses`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                names: 'wrong field name'
            })
            .expect(400)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense create: Required body is missing or invalid')
    })

    test('Should not create expense with wrong no body provided', async () => {
        const response = await request(app)
            .post(`${apiV1Prefix}/expenses`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(400)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense create: Required body is missing or invalid')
    })

    test('Should create a new expense', async () => {
        const response = await request(app)
            .post(`${apiV1Prefix}/expenses`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Weeding gift'
            })
            .expect(201)

        const expense = await Expense.findOne({
            name: 'Weeding gift',
            owner: response.body.expense.owner
        })

        expect(expense?.owner.toString()).toBe(user1Id.toString())
        expect(expense?.isActive).toBeTruthy()
    })

    test('Should create a new expense with users', async () => {
        const response = await request(app)
            .post(`${apiV1Prefix}/expenses`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Weeding gift',
                users: [
                    user2Id
                ]
            })
            .expect(201)

        const expense = await Expense.findOne({
            name: 'Weeding gift',
            owner: response.body.expense.owner
        })

        expect(expense?.owner.toString()).toBe(user1Id.toString())
        expect(expense?.isActive).toBeTruthy()
        expect(expense?.users[0].toString()).toBe(user2Id.toString())
    })
})

describe('Expense get test cases', () => {
    test('Should return all expenses that user owns', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/own`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(2)
    })

    test('Should return all inactive expenses that user owns', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/own?isActive=false`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(1)
    })

    test('Should return all active expenses that user owns', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/own?isActive=true`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(1)
    })

    test('Should return all expenses with name contains \'day\' that user owns', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/own?name=day`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(1)
    })

    test('Should return all expenses when there is no valid query that user owns', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/own?names=day`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(2)
    })

    test('Should return all expenses', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(4)
    })

    test('Should return 2 expenses where name contains \'day\'', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me?name=day`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(2)
    })

    test('Should return 1 inactive expense', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me?isActive=false`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(1)
    })

    test('Should return 3 inactive expense', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me?isActive=true`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(3)
    })

    test('Should return 2 inactive expense with name that contains \'day\'', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me?isActive=true&name=day`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.length).toBe(2)
    })
})

describe('Expenses Get by id test cases', () => {
    test('Should return expense by id when user is owner', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/${expense2Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.owner._id.toString()).toBe(user1Id.toString())
    })

    test('Should return expense by id when user is in users', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/${expense4Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(200)

        expect(response.body.users[0]._id.toString()).toBe(user1Id.toString())
    })

    test('Should return 404 when there is no expense', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/651fcd2de7da6a54dcda5111`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(404)
        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense get by id: Expense not found')
    })

    test('Should return 401 when user is not owner or in users array of expense', async () => {
        const response = await request(app)
            .get(`${apiV1Prefix}/expenses/me/${expense3Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(401)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense get by id: Unauthorized access to Expense resource')
    })
})

describe('Expenses Update by id test cases', () => {
    test('Should update expense by id', async () => {
        await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                name: 'Holidays'
            })
            .expect(204)
    })

    test('Should return 401 when user failed authentication', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                name: 'Holidays'
            })
            .expect(401)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Unauthorized access to Expense resource')
    })

    test('Should not update expense by id when body is invalid', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                owner: 'new owner'
            })
            .expect(400)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Given fields are invalid')
    })

    test('Should not update expense by id when body is missing', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense1Id}`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send()
            .expect(400)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Required body is missing')
    })

    test('Should add new user to expense by id', async () => {
        await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense3Id}/addUser`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                user: user1Id
            })
            .expect(204)
    })

    test('Should return 401 when add new user to expense by id by not authorized user', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense3Id}/addUser`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                user: user1Id
            })
            .expect(401)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Unauthorized access to Expense resource')
    })

    test('Should return 404 when updated expense not exists', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/651fcd2de7da6a54dcda5111/addUser`)
            .set('Authorization', `Bearer ${user1.tokens[0].token}`)
            .send({
                user: user1Id
            })
            .expect(404)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Expense not found')
    })

    test('Should return 422 when added user not exists', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense3Id}/addUser`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                user: '651fcd2de7da6a54dcda5111'
            })
            .expect(422)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: User not found')
    })

    test('Should return 422 added user is already part of expense users', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense3Id}/addUser`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send({
                user: user2Id
            })
            .expect(422)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Provided User is already part of Expense')
    })

    test('Should return 400 when no body was provided', async () => {
        const response = await request(app)
            .patch(`${apiV1Prefix}/expenses/${expense3Id}/addUser`)
            .set('Authorization', `Bearer ${user2.tokens[0].token}`)
            .send()
            .expect(400)

        expect(response.body.error).toBeDefined()
        expect(response.body.error).toBe('Expense update: Required body is missing or invalid')
    })
})