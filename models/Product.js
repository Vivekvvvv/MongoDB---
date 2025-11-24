const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  category: {
    type: String,
    default: 'General'
  },
  stock: {
    type: Number,
    default: 0
  },
  // 商家信息
  merchant: {
    type: String,
    required: true,
    default: '官方旗舰店'
  },
  merchantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // 供应商信息
  supplier: {
    type: String,
    required: true,
    default: '官方供应商'
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // 供应商联系方式
  supplierContact: {
    phone: String,
    email: String,
    address: String
  },
  // 发货地址
  shippingAddress: {
    province: { type: String, required: true, default: '广东省' },
    city: { type: String, required: true, default: '深圳市' },
    district: { type: String, required: true, default: '南山区' },
    detail: { type: String, required: true, default: '科技园' }
  },
  // 商品编号
  productCode: {
    type: String,
    required: true,
    unique: true
  },
  // 购买量统计
  salesCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
