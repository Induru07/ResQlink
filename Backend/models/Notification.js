const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Target info
  targetType: { type: String, enum: ['victim', 'collection-point'], required: true },
  targetRef: { type: String, required: true }, // victimId or collectionPointId

  // Message content
  title: String,
  message: String,
  items: [
    {
      itemName: String,
      quantity: Number,
      unit: String,
      category: String
    }
  ],

  // Contributor contact
  contributorId: String,
  contributorName: String,
  contributorPhone: String,
  contributorEmail: String,

  // Status
  status: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'pending' },

  // Meta
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
