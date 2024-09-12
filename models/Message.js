const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Message schema
const MessageSchema = new Schema({
  permit: {
    type: Schema.Types.ObjectId,
    ref: 'Permit', // Reference to the Permit model
    required: true,
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (the sender)
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically set the current timestamp
  }
});

// Create and export the Message model
const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
