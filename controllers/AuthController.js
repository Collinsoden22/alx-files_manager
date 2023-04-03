const { sha1 } = require('crypto-hash');
const { v4: uuidv4 } = require('uuid');

const connect = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    if (!email || !password) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.getUserByEmailAndPassword(email, await sha1(password));
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 60 * 60 * 24);

    return res.status(200).json({ token });
};

const disconnect = async (req, res) => {
    const token = req.headers['x-token'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);

    return res.status(204).end();
};


module.exports = {
    connect,
    disconnect,
};
