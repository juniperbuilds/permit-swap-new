const mongoose = require('mongoose');

const permitSchema = new mongoose.Schema({
  location: String,
  permitType: String,
  startDate: Date,
  endDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Permit', permitSchema);
