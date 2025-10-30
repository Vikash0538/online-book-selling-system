const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  provider: { 
    type: String,
    required: true
  },
  providerPaymentId: { 
    type: String,
    required: true,
    index: true,
    unique: true
  },
  order: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'inr' },
  status: { type: String },
  method: { type: String },
  receipt_url: { type: String },
  raw: { type: mongoose.Schema.Types.Mixed }, 
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
