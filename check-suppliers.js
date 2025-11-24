const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    const Product = require('./models/Product');
    const User = require('./models/User');

    // 检查供应商数据
    User.find({ role: 'merchant' })
      .then(suppliers => {
        console.log(`📦 找到 ${suppliers.length} 个供应商:\n`);

        suppliers.forEach((supplier, index) => {
          console.log(`${index + 1}. 供应商信息:`);
          console.log(`   name: ${supplier.name}`);
          console.log(`   email: ${supplier.email}`);
          console.log(`   role: ${supplier.role}`);
          console.log(`   merchantInfo.shopName: ${supplier.merchantInfo?.shopName}`);
          console.log(`   merchantInfo.shopDescription: ${supplier.merchantInfo?.shopDescription}`);
          console.log(`   merchantInfo.rating: ${supplier.merchantInfo?.rating}`);
          console.log(`   _id: ${supplier._id}`);
          console.log('---');
        });

        // 检查商品的供应商信息
        return Product.find({}).populate('supplierId', 'name merchantInfo');
      })
      .then(products => {
        console.log(`\n🛍️ 检查商品的供应商关联信息:\n`);

        products.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}:`);
          console.log(`   supplier字段: ${product.supplier}`);
          console.log(`   supplierId字段: ${product.supplierId}`);
          if (product.supplierId) {
            console.log(`   关联的供应商name: ${product.supplierId.name}`);
            console.log(`   关联的供应商shopName: ${product.supplierId.merchantInfo?.shopName}`);
          }
          console.log('---');
        });

        mongoose.connection.close();
      })
      .catch(err => {
        console.log('❌ 查询失败:', err.message);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.log('❌ 数据库连接失败:', err.message);
  });