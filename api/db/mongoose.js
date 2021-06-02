// This file handles connection logic to the MongoDB database.

const mongoose = require('mongoose');

// mongoose.Promise = global.Promise; // Because of Bluebird promises.
mongoose.connect('mongodb://localhost:27017/Mapster', { useNewUrlParser: true, useUnifiedTopology: true })
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
