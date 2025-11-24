const mongoose = require('mongoose');

// 连接数据库
mongoose.connect('mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ 数据库连接成功');

    // 测试订单模型
    const Order = require('./models/Order');

    // 创建测试订单
    const testOrder = new Order({
      userId: null, // 测试非必填
      orderNumber: '', // 手动设置空字符串，让中间件生成
      items: [{
        productId: new mongoose.Types.ObjectId(),
        name: '测试商品',
        price: 99.99,
        quantity: 1
      }],
      total: 99.99,
      shippingAddress: {
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园'
      },
      paymentInfo: {
        method: '免支付', // 测试新的支付方式
        paidAt: new Date(),
        transactionId: 'TEST123456'
      },
      status: '待发货', // 测试新的状态
      remarks: '测试订单'
    });

    // 保存订单（会触发预保存中间件）
    testOrder.save()
      .then(() => {
        console.log('✅ 订单创建成功 - 所有枚举值都有效');
        console.log('📝 订单号:', testOrder.orderNumber);
        console.log('💰 支付方式:', testOrder.paymentInfo.method);
        console.log('📦 订单状态:', testOrder.status);

        // 删除测试订单
        return Order.findByIdAndDelete(testOrder._id);
      })
      .then(() => {
        console.log('🧹 测试订单已清理');
        mongoose.connection.close();
      })
      .catch(err => {
        console.log('❌ 订单创建失败:', err.message);
        mongoose.connection.close();
      });
  })
  .catch(err => {
    console.log('❌ 数据库连接失败:', err.message);
  });