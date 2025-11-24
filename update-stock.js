const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_database';

// 导入模型
const Product = require('./models/Product');

async function updateAllProductsStock() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 获取所有库存为0或未设置库存的商品
    const productsWithoutStock = await Product.find({
      $or: [
        { stock: { $exists: false } },
        { stock: 0 },
        { stock: null }
      ]
    });

    console.log(`Found ${productsWithoutStock.length} products that need stock update`);

    // 为每个商品设置随机库存
    const updatePromises = productsWithoutStock.map(async (product) => {
      const randomStock = Math.floor(Math.random() * 200) + 50; // 50-250之间的随机库存

      await Product.findByIdAndUpdate(product._id, {
        $set: {
          stock: randomStock,
          // 同时确保有商品编号
          productCode: product.productCode || `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          // 设置默认商家
          merchant: product.merchant || '官方旗舰店',
          // 初始化销量
          salesCount: product.salesCount || Math.floor(Math.random() * 100)
        }
      });

      console.log(`Updated ${product.name}: stock = ${randomStock}`);
    });

    await Promise.all(updatePromises);

    // 统计更新结果
    const totalProducts = await Product.countDocuments();
    const productsWithStock = await Product.countDocuments({ stock: { $gt: 0 } });

    console.log('\n=== 更新完成 ===');
    console.log(`总商品数: ${totalProducts}`);
    console.log(`有库存的商品: ${productsWithStock}`);
    console.log(`更新成功!`);

  } catch (error) {
    console.error('更新库存失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  updateAllProductsStock();
}

module.exports = updateAllProductsStock;