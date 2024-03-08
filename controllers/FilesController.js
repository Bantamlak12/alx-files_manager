const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];

    if (!token) return res.status(400).json({ error: 'Token is missing.' });

    try {
      // Retrieve the user based on the token
      const userId = await redisClient.get(`auth_${token}`);
      // Find associated user based on the token
      const user = await dbClient.client
        .db(dbClient.dbName)
        .collection('users')
        .findOne({ _id: ObjectId(userId) });

      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // Specifiy the file information
      const acceptedTypes = ['folder', 'file', 'image'];

      const {
        name, type, parentId = 0, isPublic = false, data,
      } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }
      if (!type || !acceptedTypes.includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      if (parentId !== 0) {
        const parentFile = await dbClient.client
          .db(dbClient.dbName)
          .collection('files')
          .findOne({ _id: ObjectId(parentId) });

        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Add the user ID to the document
      //  Prepare file document
      const fileDocument = {
        userId,
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? parentId : ObjectId(parentId),
      };

      if (type === 'folder') {
        const newFile = await dbClient.client
          .db(dbClient.dbName)
          .collection('files')
          .insertOne(fileDocument);

        return res.status(201).json(newFile.ops[0]);
      }
      if (type === 'file' || type === 'image') {
        // Save file to disk
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        const fileUUIDV4 = uuidv4();
        const localPath = path.join(folderPath, fileUUIDV4);

        // Decode base64 data and write to file
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      }

      // Add the new file document in the collection files
      const newFile = await dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .insertOne(fileDocument);

      return res.status(201).json(newFile.ops[0]);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];

    try {
      // Get the user Id using the token
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Get the file document associated to the document.
      const fileID = req.params.id;
      const file = await dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .findOne({ _id: ObjectId(fileID), userId });

      if (!file) return res.status(404).json({ error: 'Not found' });

      return res.status(200).json(file);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];

    try {
      // Get the user Id using the token
      const userId = await redisClient.get(`auth_${token}`);

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Get the query parameters
      const parentID = req.query.parentId || 0;
      const pageNum = req.query.page || 0;
      const pageSize = 20;

      const files = await dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .find({ parentId: +parentID, userId })
        .skip(+pageNum * pageSize)
        .limit(pageSize)
        .toArray();

      return res.json(files);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putPublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    try {
      // Get the user Id using the token
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const file = dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .find({ _id: ObjectId(fileId), userId });

      if (!file) return res.status(404).json({ error: 'Not found' });
      await dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: true } });

      const updatedFile = await dbClient.client
        .db(dbClient.dbName)
        .conllection('files')
        .findOne({ _id: ObjectId(fileId) });

      return res.status(200).json(updatedFile);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async putUnpublish(req, res) {
    const token = req.headers['x-token'];
    const fileId = req.params.id;

    try {
      // Get the user Id using the token
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const file = dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .find({ _id: ObjectId(fileId), userId });

      if (!file) return res.status(404).json({ error: 'Not found' });
      await dbClient.client
        .db(dbClient.dbName)
        .collection('files')
        .updateOne({ _id: ObjectId(fileId) }, { $set: { isPublic: false } });

      const updatedFile = await dbClient.client
        .db(dbClient.dbName)
        .conllection('files')
        .findOne({ _id: ObjectId(fileId) });

      return res.status(200).json(updatedFile);
    } catch (err) {
      console.log(`Error: ${err}`);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
