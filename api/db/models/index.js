// This file combines all the models so that they are easier to import.

const { Document } = require('./document.model');
const { Shape } = require('./shape.model');
const { User } = require('./user.model');

module.exports = {
    Document,
    Shape,
    User
}