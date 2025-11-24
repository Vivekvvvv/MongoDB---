const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    const Product = require('./models/Product');
    const User = require('./models/User');

    // 查看所有商品
    Product.find({})
      .then(products => {
        console.log(`📦 数据库中共有 ${products.length} 个商品:\n`);

        products.forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   ID: ${product._id}`);
          console.log(`   供应商: ${product.supplier}`);
          console.log(`   商家: ${product.merchant}`);
          console.log(`   价格: ¥${product.price}`);
          console.log(`   库存: ${product.stock}`);
          console.log(`   销量: ${product.salesCount}`);
          console.log('---');
        });

        // 查看所有用户（作为可能的供应商）
        return User.find({});
      })
      .then(users => {
        console.log(`\n👥 数据库中共有 ${users.length} 个用户:\n`);

        users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.username}`);
          console.log(`   ID: ${user._id}`);
          console.log(`   邮箱: ${user.email}`);
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