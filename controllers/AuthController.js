const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
// const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Basic ')) {
      const encodedCredentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(
        encodedCredentials,
        'base64',
      ).toString('utf-8');

      const [email, password] = decodedCredentials.split(':');

      try {
        //   Hash the password
        const hashedpasswd = crypto
          .createHash('sha1')
          .update(password, 'utf-8')
          .digest('hex');

        //   Find the user associated to this email
        const user = await dbClient.client
          .db(dbClient.dbName)
          .collection('users')
          .findOne({ $and: [{ email }, { password: hashedpasswd }] });

        if (!user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = uuidv4();
        const key = `auth_${token}`;

        // Store the id in redis
        redisClient.set(key, user._id.toString(), 24 * 60 * 60);
        return res.status(200).json({ token });
      } catch (err) {
        console.error(`Error: ${err}`);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    } else {
      return res.status(400).json({ error: 'Bad Request' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) return res.status(400).json({ error: 'Token is missing.' });

    try {
      const userId = await redisClient.get(`auth_${token}`);
      // Find associated user based on the token
      // const user = await dbClient.client
      //   .db(dbClient.dbName)
      //   .collection('users')
      //   .findOne({ _id: ObjectId(userId) });

      // Alternatively, check the user based on the userId
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      await redisClient.del(`auth_${token}`);
      return res.sendStatus(204);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
