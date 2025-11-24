// 地址管理功能测试脚本
const mongoose = require('mongoose');
const Address = require('./models/Address');
const User = require('./models/User');

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_database';

async function testAddressFunctionality() {
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

    // 清除现有测试地址
    await Address.deleteMany({ userId: testUser._id });
    console.log('🗑️ 清除现有测试地址');

    // 创建测试地址
    const testAddresses = [
      {
        userId: testUser._id,
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园南区软件产业基地',
        postalCode: '518000',
        isDefault: true,
        tag: '公司',
        order: 1
      },
      {
        userId: testUser._id,
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '深圳市',
        district: '福田区',
        detail: '华强北路2000号',
        postalCode: '518000',
        isDefault: false,
        tag: '家',
        order: 2
      }
    ];

    console.log('📝 创建测试地址...');
    const savedAddresses = await Address.insertMany(testAddresses);
    console.log(`✅ 成功创建 ${savedAddresses.length} 个地址`);

    // 测试读取地址
    const allAddresses = await Address.find({ userId: testUser._id }).sort({ order: 1 });
    console.log('📋 当前用户地址列表:');
    allAddresses.forEach((addr, index) => {
      console.log(`  ${index + 1}. ${addr.name} - ${addr.province}${addr.city}${addr.district}${addr.detail} (${addr.tag})${addr.isDefault ? ' [默认]' : ''}`);
    });

    // 测试更新地址
    console.log('\n✏️ 测试更新第一个地址...');
    const updateResult = await Address.findByIdAndUpdate(
      savedAddresses[0]._id,
      {
        name: '张三丰',
        postalCode: '518001',
        updatedAt: new Date()
      },
      { new: true }
    );
    console.log(`✅ 地址更新成功: ${updateResult.name} - 邮编: ${updateResult.postalCode}`);

    // 测试地址排序
    console.log('\n🔄 测试地址排序功能...');
    await Address.findByIdAndUpdate(savedAddresses[1]._id, { order: 0 });

    const sortedAddresses = await Address.find({ userId: testUser._id }).sort({ order: 1 });
    console.log('📋 排序后的地址列表:');
    sortedAddresses.forEach((addr, index) => {
      console.log(`  ${index + 1}. [顺序: ${addr.order}] ${addr.name} - ${addr.detail} (${addr.tag})`);
    });

    // 测试删除地址
    console.log('\n🗑️ 测试删除地址功能...');
    const deleteResult = await Address.findByIdAndDelete(savedAddresses[1]._id);
    console.log(`✅ 地址删除成功: ${deleteResult.name} - ${deleteResult.detail}`);

    // 最终地址数量
    const finalCount = await Address.countDocuments({ userId: testUser._id });
    console.log(`📊 最终用户地址数量: ${finalCount}`);

    console.log('\n🎉 地址管理功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  } finally {
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('🔌 MongoDB连接已关闭');
  }
}

// 运行测试
testAddressFunctionality().catch(console.error);