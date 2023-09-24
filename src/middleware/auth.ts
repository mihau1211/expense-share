import jwt, { Jwt, JwtPayload } from 'jsonwebtoken'
import User from '../models/user'

const secret = process.env.JWT_SECRET
if (typeof secret !== 'string') {
    throw new Error('ERROR: Secret has wrong type.')
}

const auth = async (req: any, res: any, next: Function) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, secret)
        if (typeof decoded === 'string') {
            throw new Error()
        }
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (error:any) {
        console.log(error.message)
        res.status(401).send({ error: 'Please authenticate.' })
    }
}

export default auth