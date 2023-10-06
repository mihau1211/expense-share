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

    // TODO: Get by ID && Patch addUser, Patch
})