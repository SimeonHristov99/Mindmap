// This file handles connection logic to the MongoDB database.

const mongoose = require('mongoose');

require('dotenv').config();

mongoose.connect(process.env.CONNECTION_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB successfully! :)');
    })
    .catch((err) => {
        console.log('Error while attempting to connect to MongoDB');
        console.log(err);
    });

// To prevent deprecation warnings (from MongoDB native driver)
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};
