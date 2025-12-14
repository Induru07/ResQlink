const mongoose = require('mongoose');

const CollectionPointSchema = new mongoose.Schema({
  // Unique ID e.g., CP001
  collectionPointId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  managedByContributorId: { type: String, required: true, ref: 'Contributor' },
  contactPhone: String,
  contactEmail: String,
  address: String,
  district: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  hours: String, // e.g., "Daily 9am-6pm"
  capacityNote: String, // e.g., "Can store up to 2 tons"
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollectionPoint', CollectionPointSchema);
