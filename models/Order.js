const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    price: Number,
    quantity: Number
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: '已支付',
    enum: ['待支付', '已支付', '发货中', '已完成']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
