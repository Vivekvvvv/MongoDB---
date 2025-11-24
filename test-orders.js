// 订单管理功能测试脚本
const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
const Product = require('./models/Product');
const Address = require('./models/Address');

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_database';

async function testOrderFunctionality() {
  try {
    console.log('🔗 连接到MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB连接成功');

    // 查找测试用户
    const testUser = await User.findOne({ email: '12345@123.com' });
    if (!testUser) {
      console.log('❌ 测试用户不存在，请先运行服务器创建测试用户');
      return;
    }
    console.log(`✅ 找到测试用户: ${testUser.name} (${testUser.email})`);

    // 查找测试商品
    const testProducts = await Product.find().limit(3);
    if (testProducts.length < 2) {
      console.log('❌ 测试商品不足，请先运行服务器创建测试商品');
      return;
    }
    console.log(`✅ 找到 ${testProducts.length} 个测试商品`);

    // 查找或创建测试地址
    let testAddress = await Address.findOne({ userId: testUser._id });
    if (!testAddress) {
      testAddress = new Address({
        userId: testUser._id,
        name: testUser.name,
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区软件产业基地',
        postalCode: '518000',
        isDefault: true,
        tag: '公司',
        order: 1
      });
      await testAddress.save();
      console.log('✅ 创建了测试地址');
    } else {
      console.log('✅ 找到现有测试地址');
    }

    // 清除现有测试订单
    await Order.deleteMany({ userId: testUser._id });
    console.log('🗑️ 清除现有测试订单');

    // 创建测试订单
    console.log('📝 创建测试订单...');
    const testOrder = new Order({
      orderNumber: `TEST${Date.now()}`,
      userId: testUser._id,
      items: [
        {
          productId: testProducts[0]._id,
          name: testProducts[0].name,
          price: testProducts[0].price,
          quantity: 2,
          merchant: testProducts[0].merchant,
          merchantId: testProducts[0].merchantId,
          imageUrl: testProducts[0].imageUrl
        },
        {
          productId: testProducts[1]._id,
          name: testProducts[1].name,
          price: testProducts[1].price,
          quantity: 1,
          merchant: testProducts[1].merchant,
          merchantId: testProducts[1].merchantId,
          imageUrl: testProducts[1].imageUrl
        }
      ],
      total: (testProducts[0].price * 2) + testProducts[1].price,
      shippingAddress: {
        name: testAddress.name,
        phone: testAddress.phone,
        province: testAddress.province,
        city: testAddress.city,
        district: testAddress.district,
        detail: testAddress.detail,
        postalCode: testAddress.postalCode
      },
      paymentInfo: {
        method: '余额支付',
        paidAt: new Date(),
        transactionId: `TEST${Date.now()}`
      },
      status: '已支付',
      remarks: '测试订单备注'
    });

    const savedOrder = await testOrder.save();
    console.log(`✅ 测试订单创建成功: ${savedOrder.orderNumber}`);

    // 创建不同状态的测试订单
    const statusOrders = [
      { status: '待支付', delay: 0 },
      { status: '发货中', delay: 1 },
      { status: '已完成', delay: 2 },
      { status: '已取消', delay: 3 }
    ];

    for (const { status, delay } of statusOrders) {
      const order = new Order({
        orderNumber: `TEST${Date.now() + delay}`,
        userId: testUser._id,
        items: [
          {
            productId: testProducts[2 % testProducts.length]._id,
            name: testProducts[2 % testProducts.length].name,
            price: testProducts[2 % testProducts.length].price,
            quantity: 1,
            merchant: testProducts[2 % testProducts.length].merchant,
            merchantId: testProducts[2 % testProducts.length].merchantId,
            imageUrl: testProducts[2 % testProducts.length].imageUrl
          }
        ],
        total: testProducts[2 % testProducts.length].price,
        shippingAddress: {
          name: testAddress.name,
          phone: testAddress.phone,
          province: testAddress.province,
          city: testAddress.city,
          district: testAddress.district,
          detail: testAddress.detail,
          postalCode: testAddress.postalCode
        },
        paymentInfo: {
          method: '余额支付',
          paidAt: status !== '待支付' ? new Date() : null,
          transactionId: status !== '待支付' ? `TEST${Date.now() + delay}` : null
        },
        status,
        logistics: status === '发货中' ? {
          company: '顺丰快递',
          trackingNumber: `SF${Date.now() + delay}`,
          shippedAt: new Date(Date.now() - delay * 24 * 60 * 60 * 1000),
          status: '已发货'
        } : status === '已完成' ? {
          company: '顺丰快递',
          trackingNumber: `SF${Date.now() + delay}`,
          shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          status: '已签收'
        } : undefined,
        remarks: `测试订单 - ${status}`,
        createdAt: new Date(Date.now() - delay * 24 * 60 * 60 * 1000)
      });

      await order.save();
      console.log(`✅ 创建${status}状态测试订单`);
    }

    // 测试订单读取
    const orders = await Order.find({ userId: testUser._id })
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl')
      .populate('items.merchantId', 'name')
      .sort({ createdAt: -1 });

    console.log('\n📋 用户订单列表:');
    orders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} - ${order.status} - ¥${order.total} - ${order.items.length}件商品`);
      order.items.forEach((item, itemIndex) => {
        console.log(`     ${itemIndex + 1}. ${item.name} x${item.quantity} = ¥${item.price * item.quantity}`);
      });
    });

    // 测试订单状态更新
    console.log('\n🔄 测试订单状态更新...');
    const testOrderId = savedOrder._id;

    // 测试支付订单
    console.log('💳 测试支付订单...');
    const paidOrder = await Order.findByIdAndUpdate(
      testOrderId,
      {
        status: '已支付',
        'paymentInfo.paidAt': new Date(),
        'paymentInfo.transactionId': `PAY${Date.now()}`
      },
      { new: true }
    );
    console.log(`✅ 订单支付成功: ${paidOrder.status}`);

    // 测试发货订单
    console.log('🚚 测试发货订单...');
    const shippedOrder = await Order.findByIdAndUpdate(
      testOrderId,
      {
        status: '发货中',
        logistics: {
          company: '顺丰快递',
          trackingNumber: `SF${Date.now()}`,
          shippedAt: new Date(),
          status: '已发货'
        }
      },
      { new: true }
    );
    console.log(`✅ 订单发货成功: ${shippedOrder.status}, 物流单号: ${shippedOrder.logistics.trackingNumber}`);

    // 测试确认收货
    console.log('📦 测试确认收货...');
    const completedOrder = await Order.findByIdAndUpdate(
      testOrderId,
      {
        status: '已完成',
        'logistics.status': '已签收',
        'logistics.deliveredAt': new Date()
      },
      { new: true }
    );
    console.log(`✅ 订单完成: ${completedOrder.status}`);

    // 测试订单统计
    const totalOrders = await Order.countDocuments({ userId: testUser._id });
    const statusCounts = await Order.aggregate([
      { $match: { userId: testUser._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 订单统计:');
    console.log(`总订单数: ${totalOrders}`);
    statusCounts.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}个`);
    });

    console.log('\n🎉 订单管理功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('🔌 MongoDB连接已关闭');
  }
}

// 运行测试
testOrderFunctionality().catch(console.error);