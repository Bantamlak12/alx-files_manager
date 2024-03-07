# Project: 0x04. Files manager

This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

Of course, this kind of service already exists in the real life - it’s a learning purpose to assemble each piece and build a full product.

## Resources

#### Read or watch:

- [Node JS getting started](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
- [Process API doc](https://node.readthedocs.io/en/latest/api/process/)
- [Express getting started](https://expressjs.com/en/starter/installing.html)
- [Mocha documentation](https://mochajs.org/)
- [Nodemon documentation](https://github.com/remy/nodemon#nodemon)
- [MongoDB](https://github.com/mongodb/node-mongodb-native)
- [Bull](https://github.com/OptimalBits/bull)
- [Image thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [Mime-Types](https://www.npmjs.com/package/mime-types)
- [Redis](https://github.com/redis/node-redis)

## Tasks

| Task                      | File                                                                                                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0. Redis utils            | [utils/redis.js](./utils/redis.js)                                                                                                                                                             |
| 1. MongoDB utils          | [utils/db.js](./utils/db.js)                                                                                                                                                                   |
| 2. First API              | [server.js](./server.js), [routes/index.js](./routes/index.js), [controllers/AppController.js](./controllers/AppController.js)                                                                 |
| 3. Create a new user      | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/UsersController.js](./controllers/UsersController.js)                                                                   |
| 4. Authenticate a user    | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/UsersController.js](./controllers/UsersController.js), [controllers/AuthController.js](./controllers/AuthController.js) |
| 5. First file             | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/FilesController.js](./controllers/FilesController.js)                                                                   |
| 6. Get and list file      | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/FilesController.js](./controllers/FilesController.js)                                                                   |
| 7. File publish/unpublish | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/FilesController.js](./controllers/FilesController.js)                                                                   |
| 8. File data              | [utils/](./utils/), [routes/index.js](./routes/index.js), [controllers/FilesController.js](./controllers/FilesController.js)                                                                   |
| 9. Image Thumbnails       | [utils/](./utils/), [controllers/FilesController.js](./controllers/FilesController.js),[worker.js](./worker.js)                                                                                |
