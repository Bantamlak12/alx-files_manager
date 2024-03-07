import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    this.dbName = process.env.DB_DATABASE || 'file_manager';
    this.mongoConnected = false;
    this.client = new MongoClient(`mongodb://${host}:${port}`, {
      useUnifiedTopology: true,
    });

    (async () => {
      try {
        await this.client.connect();
        this.mongoConnected = true;
      } catch (err) {
        console.error(`Error connecting to MongoDB: ${err.message}`);
      }
    })();
  }

  isAlive() {
    return this.mongoConnected;
  }

  async nbUsers() {
    const count = await this.client
      .db(this.dbName)
      .collection('users')
      .countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this.client
      .db(this.dbName)
      .collection('files')
      .countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
