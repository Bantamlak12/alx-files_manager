const Bull = require('bull');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db');

const fileQueue = new Bull('fileQueue');

const generateThumbnail = async (originalPath, thumbnailPath, size) => {
  const thumbnail = await imageThumbnail(originalPath, { width: size });
  fs.writeFileSync(thumbnailPath, thumbnail);
};

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const fileDocument = await dbClient.dbClient
    .db(dbClient.dbName)
    .collection('files')
    .findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });

  if (!fileDocument) throw new Error('File not found');

  const thumbnailSizes = [500, 250, 100];
  const filePath = fileDocument.localPath;

  for (const size of thumbnailSizes) {
    const thumbnailFilePath = `${filePath}_${size}`;
    generateThumbnail(filePath, thumbnailFilePath, size);
  }
});
