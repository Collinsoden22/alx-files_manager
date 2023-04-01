const { sha1 } = require('crypto-hash');
const { ObjectId } = require('mongodb');
const DBClient = require('../db');
const { MissingParameterError } = require('../utils/errors');

/**
 * Create a new user in DB
 * @param {object} req - The Express request object
 * @param {object} res - The Express response object
 * @param {Function} next - The next middleware function
 */
async function postNew(req, res, next) {
    try {
        const { email, password } = req.body;
        if (!email) {
            throw new MissingParameterError('email');
        }
        if (!password) {
            throw new MissingParameterError('password');
        }
        const dbClient = await DBClient.connect();
        const existingUser = await dbClient.db.collection('users').findOne({ email });
        if (existingUser) {
            dbClient.close();
            return res.status(400).json({ error: 'Already exist' });
        }
        const newUser = {
            email,
            password: await sha1(password),
            _id: new ObjectId(),
        };
        await dbClient.db.collection('users').insertOne(newUser);
        dbClient.close();
        return res.status(201).json({ id: newUser._id, email: newUser.email });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    postNew,
};
