const mongoose = require('mongoose');

require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Mongoose, use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`${err.message}`);
});

require('./models/House');
require('./models/User');
require('./models/Order');

const app = require('./app');
app.set('port', process.env.PORT || 7777);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
