import request from 'supertest'
import app from '../src/app'
import User from '../src/models/user'
import { setupDb, user1, user2, user1Id, user2Id } from './fixtures/db'

beforeEach(setupDb, 10000)

test('Should thrown a password validation error', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Mike',
            password: '123',
            email: 'mike@gmail.com'
        })
        .expect(400)

    expect(response.body.user).toBeUndefined()
})

test('Should thrown an email validation error', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Mike',
            password: 'MikePwd1@',
            email: 'mikegmail.com'
        })
        .expect(400)

    expect(response.body.user).toBeUndefined()
})

test('Should thrown an email unique constraint violation error', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Bob',
            password: 'BobPwd1@',
            email: 'bob@gmail.com'
        })
        .expect(400)

    expect(response.body.user).toBeUndefined()
})

test('Should create user in db', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Mike',
            password: 'MikePwd1@',
            email: 'mike@gmail.com'
        })
        .expect(201)

    const user = await User.findById(response.body.user._id)

    expect(user).not.toBeNull()
    expect(user?.tokens[0].token).toBe(response.body.token)
})

test('Should get all users', async () => {
    const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)

    expect(response.body.length).toBe(2)

})

test('Should login user and return second token', async () => {
    const response = await request(app)
        .post('/login')
        .send({
            email: user1.email,
            password: user1.password
        })
        .expect(200)
    const user: any = await User.findById(user1Id)
    expect(user.tokens[1].token).toBe(response.body.token)
})

test('Should not login non-existing user', async () => {
    await request(app)
        .post('/login')
        .send({
            email: 'non-exist',
            password: 'non-exist'
        })
        .expect(400)
})

test('Should get user profile', async () => {
    const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${user1.tokens[0].token}`)
        .send()
        .expect(200)
})