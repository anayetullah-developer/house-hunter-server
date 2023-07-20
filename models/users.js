const mongoose = require('mongoose');
const User = new mongoose.Schema(
    {
        name: {type: String, required: true},
        email: {type: String, required: true, unique: true},
        phone: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, required: true},
    },
    {
        collection: 'user-data'
    }
)

const model = mongoose.model('User-Data', User)

module.exports = model;