const mongoose = require('mongoose');

const Product = require('./models/Product');
const User = require('./models/User');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    // 获取所有供应商
    return User.find({ role: 'merchant' });
  })
  .then(suppliers => {
    console.log('📦 找到供应商:', suppliers.map(s => s.name));

    // 创建供应商映射
    const supplierMap = {};
    suppliers.forEach(supplier => {
      supplierMap[supplier.name] = supplier._id;
    });

    // 更新所有没有supplierId的商品
    return Product.find({ supplierId: { $exists: false } })
      .then(products => {
        console.log(`🛍️ 找到 ${products.length} 个需要更新供应商的商品`);

        const updatePromises = products.map(product => {
          // 根据商品类别或名称分配供应商
          let supplierName = '通用供应商'; // 默认供应商

          if (product.category === 'Electronics') {
            supplierName = 'Apple官方供应商'; // 电子产品统一分配给Apple供应商
          } else if (product.category === 'Home') {
            supplierName = '小米官方供应商'; // 家居用品分配给小米供应商
          } else if (product.category === 'Beauty') {
            supplierName = 'Sony官方供应商'; // 美妆用品分配给Sony供应商
          } else if (product.category === 'Clothing') {
            supplierName = '戴森官方供应商'; // 服装分配给戴森供应商
          } else if (product.category === 'Books') {
            supplierName = '联想官方供应商'; // 书籍分配给联想供应商
          }

          const supplierId = supplierMap[supplierName];
          console.log(`更新商品: ${product.name} -> 供应商: ${supplierName}`);

          return Product.findByIdAndUpdate(product._id, {
            supplierId: supplierId,
            supplier: supplierName
          }, { new: true });
        });

        return Promise.all(updatePromises);
      });
  })
  .then(updatedProducts => {
    console.log(`✅ 成功更新 ${updatedProducts.length} 个商品的供应商信息`);

    // 验证更新结果
    return Product.find({}).populate('supplierId', 'name merchantInfo');
  })
  .then(allProducts => {
    console.log('\n🔍 验证更新结果:');
    allProducts.slice(0, 5).forEach(product => {
      console.log(`${product.name}: ${product.supplier} (ID: ${product.supplierId?._id})`);
    });

    mongoose.connection.close();
  })
  .catch(err => {
    console.log('❌ 操作失败:', err.message);
    mongoose.connection.close();
  });