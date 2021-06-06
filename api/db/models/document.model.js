const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        trim: true
    },
    // for auth
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const Document = mongoose.model('Document', DocumentSchema);

module.exports = { Document };