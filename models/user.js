const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

UserSchema.pre('save', async function(next) {
  const hashedPassword = await bcrypt.has(this.password, 10)
  this.password = hashedPassword
  next()
})

const User = mongoose.model('user', UserSchema);
module.exports = User
