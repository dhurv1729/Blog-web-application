const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
    imageName: String
});

module.exports = mongoose.model('uploadimage', uploadSchema);