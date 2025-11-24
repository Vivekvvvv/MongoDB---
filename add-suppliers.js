const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    const Product = require('./models/Product');
    const User = require('./models/User');

    // 创建供应商用户
    const suppliers = [
      {
        name: 'Apple官方供应商',
        email: 'apple@example.com',
        password: 'password123',
        role: 'merchant',
        merchantInfo: {
          shopName: 'Apple官方供应商',
          shopDescription: '苹果官方授权供应商',
          rating: 4.8,
          contactPhone: '400-666-8800'
        }
      },
      {
        name: '小米官方供应商',
        email: 'xiaomi@example.com',
        password: 'password123',
        role: 'merchant',
        merchantInfo: {
          shopName: '小米官方供应商',
          shopDescription: '小米官方授权供应商',
          rating: 4.6,
          contactPhone: '400-100-5678'
        }
      },
      {
        name: '戴森官方供应商',
        email: 'dyson@example.com',
        password: 'password123',
        role: 'merchant',
        merchantInfo: {
          shopName: '戴森官方供应商',
          shopDescription: '戴森官方授权供应商',
          rating: 4.5,
          contactPhone: '400-920-7158'
        }
      },
      {
        name: 'Sony官方供应商',
        email: 'sony@example.com',
        password: 'password123',
        role: 'merchant',
        merchantInfo: {
          shopName: 'Sony官方供应商',
          shopDescription: '索尼官方授权供应商',
          rating: 4.7,
          contactPhone: '400-810-0000'
        }
      },
      {
        name: '联想官方供应商',
        email: 'lenovo@example.com',
        password: 'password123',
        role: 'merchant',
        merchantInfo: {
          shopName: '联想官方供应商',
          shopDescription: '联想官方授权供应商',
          rating: 4.4,
          contactPhone: '400-810-8888'
        }
      }
    ];

    // 批量创建供应商
    User.insertMany(suppliers)
      .then(createdSuppliers => {
        console.log(`✅ 成功创建 ${createdSuppliers.length} 个供应商:`);
        createdSuppliers.forEach(supplier => {
          console.log(`- ${supplier.username} (ID: ${supplier._id})`);
        });

        // 获取所有商品并更新供应商信息
        return Product.find({});
      })
      .then(products => {
        console.log('\n🔄 开始更新商品供应商信息...');

        // 商品与供应商的映射关系
        const productSupplierMap = {
          'iPhone 15 Pro': 'Apple官方供应商',
          'MacBook Air M3': 'Apple官方供应商',
          'AirPods Pro 2': 'Apple官方供应商',
          'iPad Air': 'Apple官方供应商',
          '小米14 Ultra': '小米官方供应商',
          '戴森V15吸尘器': '戴森官方供应商',
          'Sony WH-1000XM5': 'Sony官方供应商',
          'ThinkPad X1 Carbon': '联想官方供应商'
        };

        // 找到供应商ID的映射
        return User.find({ name: { $in: Object.values(productSupplierMap) } })
          .then(suppliers => {
            const supplierMap = {};
            suppliers.forEach(supplier => {
              supplierMap[supplier.name] = supplier._id;
            });

            // 更新每个商品的供应商信息
            const updatePromises = products.map(product => {
              const supplierName = productSupplierMap[product.name];
              const supplierId = supplierMap[supplierName];

              if (supplierId) {
                return Product.findByIdAndUpdate(product._id, {
                  supplier: supplierName,
                  supplierId: supplierId
                }, { new: true });
              }
              return Promise.resolve(product);
            });

            return Promise.all(updatePromises);
          });
      })
      .then(updatedProducts => {
        console.log('✅ 商品供应商信息更新完成:');
        updatedProducts.forEach(product => {
          console.log(`- ${product.name}: ${product.supplier} (ID: ${product.supplierId})`);
        });

        mongoose.connection.close();
      })
      .catch(err => {
        console.log('❌ 操作失败:', err.message);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.log('❌ 数据库连接失败:', err.message);
  });