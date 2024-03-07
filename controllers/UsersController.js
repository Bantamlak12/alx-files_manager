const crypto = require('crypto');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    // Check if email exists in the database
    const userExist = await dbClient.client
      .db(dbClient.dbName)
      .collection('users')
      .findOne({ email });

    if (userExist) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password
    const hashedpasswd = crypto
      .createHash('sha1')
      .update(password, 'utf-8')
      .digest('hex');

    // Create new user object
    const newUser = {
      email,
      password: hashedpasswd,
    };

    // Insert the new user into the database
    try {
      const result = await dbClient.client
        .db(dbClient.dbName)
        .collection('users')
        .insertOne(newUser);

      const insertedUser = {
        id: result.insertedId,
        email: newUser.email,
      };

      return res.status(201).json(insertedUser);
    } catch (err) {
      console.error(`Error creating user: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
