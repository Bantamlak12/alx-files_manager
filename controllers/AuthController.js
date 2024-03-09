const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(400).json({ error: 'Bad Request' });
    }
    const encodedCredentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64',
    ).toString('utf-8');
    const [email, ...rest] = decodedCredentials.split(':');
    const password = rest.join(':');

    try {
      //   Hash the password
      const hashedpasswd = crypto
        .createHash('sha1')
        .update(password, 'utf-8')
        .digest('hex');

      //   Find the user associated to this email and hashed password
      const user = await dbClient.client
        .db(dbClient.dbName)
        .collection('users')
        .findOne({
          $and: [
            { email: { $eq: email } },
            { password: { $eq: hashedpasswd } },
          ],
        });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = uuidv4();
      const key = `auth_${token}`;

      // Store the id in redis
      // 86,400 is expiration time of the token in a day (24h *  3600s)
      await redisClient.set(key, user._id.toString(), 86400);
      return res.status(200).json({ token });
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');

    try {
      // Retrieve the user ID based on the token
      const userId = await redisClient.get(`auth_${token}`);

      // Check if the user is authorized
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token from Redis
      await redisClient.del(`auth_${token}`);

      return res.status(204).json({});
    } catch (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
