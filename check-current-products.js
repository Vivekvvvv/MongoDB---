const mongoose = require('mongoose');
const Product = require('./models/Product');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    // 检查数据库中的所有商品
    return Product.find({});
  })
  .then(products => {
    console.log(`📦 数据库中共有 ${products.length} 个商品:\n`);

    products.slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   supplier: ${product.supplier}`);
      console.log(`   supplierId: ${product.supplierId}`);
      console.log(`   merchant: ${product.merchant}`);
      console.log(`   merchantId: ${product.merchantId}`);
      console.log('---');
    });

    // 检查缺少supplierId的商品数量
    const withoutSupplierId = products.filter(p => !p.supplierId);
    console.log(`\n⚠️ 缺少supplierId的商品数量: ${withoutSupplierId.length}`);

    mongoose.connection.close();
  })
  .catch(err => {
    console.log('❌ 查询失败:', err.message);
    mongoose.connection.close();
  });