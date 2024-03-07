const express = require('express');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON data
app.use(express.json());

// Load all routes from routes/index.js
app.use(routes);

app.listen(PORT, () => {
  console.log(`Express app is running on port: ${PORT}`);
});
