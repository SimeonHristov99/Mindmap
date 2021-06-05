const mongoose = require('mongoose');

const ShapeSchema = new mongoose.Schema({
    _docId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    id: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    label: {
        type: String,
        trim: true
    },
    translateX: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    translateY: {
        type: mongoose.Types.Decimal128,
        required: true,
    },
    backgroundColor: {
        type: String,
        trim: true
    },
    textColor: {
        type: String,
        trim: true
    },
    borderColor: {
        type: String,
        required: true,
        trim: true
    }
})

const Shape = mongoose.model('Shape', ShapeSchema);

module.exports = { Shape };