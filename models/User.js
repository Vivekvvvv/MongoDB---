const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'user', // 'user' or 'admin' or 'merchant'
    enum: ['user', 'admin', 'merchant']
  },
  age: {
    type: Number
  },
  // 用户余额
  balance: {
    type: Number,
    default: 10000, // 初始余额10000元
    min: 0
  },
  // 商家信息（当role为merchant时）
  merchantInfo: {
    shopName: {
      type: String
    },
    shopDescription: {
      type: String
    },
    businessLicense: {
      type: String
    },
    contactPhone: {
      type: String
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    totalSales: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
