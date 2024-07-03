// models/user.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String },
  mobile: { type: String },
  school: { type: String },
  bio: { type: String },
  profilePic: { type: String }, // Store URL or base64 string
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

module.exports = User;
