const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    steamid: String,
    balance: Number,
});

module.exports = mongoose.model("User", userSchema);