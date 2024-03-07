import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.redis = redis.createClient();
    this.redisConnected = true;

    this.redis.on('error', (err) => {
      console.error(err.message);
      this.redisConnected = false;
    });
  }

  isAlive() {
    return this.redisConnected;
  }

  async get(key) {
    const getAsync = promisify(this.redis.get).bind(this.redis);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    const setAsync = promisify(this.redis.set).bind(this.redis);
    await setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    const delAsync = promisify(this.redis.del).bind(this.redis);
    await delAsync(key);
  }
}
// Create and export an instance of RedisClient
const redisClient = new RedisClient();
module.exports = redisClient;
