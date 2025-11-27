require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Logistics = require('./models/Logistics');
const Address = require('./models/Address');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_database';

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Connected to MongoDB');
  seedDatabase();
})
.catch(err => console.error('Could not connect to MongoDB', err));

async function seedDatabase() {
  try {
    // Seed Admin
    const adminEmail = '12345@123.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: '12345',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin account created: 12345@123.com / 12345');
    }

    // 创建默认商家用户（增加额外商家）
    const merchants = [
      {
        name: '官方旗舰店',
        email: 'merchant1@shop.com',
        password: '123456',
        role: 'merchant',
        merchantInfo: {
          shopName: '官方旗舰店',
          shopDescription: '官方正品，品质保证',
          contactPhone: '400-888-8888',
          rating: 4.8,
          totalSales: 1200
        }
      },
      {
        name: '潮流数码',
        email: 'merchant2@shop.com',
        password: '123456',
        role: 'merchant',
        merchantInfo: {
          shopName: '潮流数码',
          shopDescription: '最新数码产品，潮流前沿',
          contactPhone: '400-999-9999',
          rating: 4.6,
          totalSales: 800
        }
      },
      {
        name: '家居良品',
        email: 'merchant3@home.com',
        password: '123456',
        role: 'merchant',
        merchantInfo: {
          shopName: '家居良品',
          shopDescription: '舒适家居，品质之选',
          contactPhone: '400-777-7777',
          rating: 4.7,
          totalSales: 600
        }
      },
      {
        name: '时尚服饰',
        email: 'merchant4@fashion.com',
        password: '123456',
        role: 'merchant',
        merchantInfo: {
          shopName: '时尚服饰',
          shopDescription: '潮流时尚，价格亲民',
          contactPhone: '400-666-6666',
          rating: 4.5,
          totalSales: 700
        }
      }
    ];

    for (const merchantData of merchants) {
      const existingMerchant = await User.findOne({ email: merchantData.email });
      if (!existingMerchant) {
        const merchant = new User(merchantData);
        await merchant.save();
        console.log(`Merchant account created: ${merchantData.email}`);
      }
    }

    // 获取所有商家并建立名称/邮箱到 merchantId 的映射
    const merchantDocs = await User.find({ role: 'merchant' });
    const merchantMap = {};
    merchantDocs.forEach(m => {
      const shopName = m.merchantInfo && m.merchantInfo.shopName ? m.merchantInfo.shopName : m.name;
      merchantMap[shopName] = m._id;
      merchantMap[m.email] = m._id;
      merchantMap[m.name] = m._id;
    });

    // Seed Products - 强制刷新数据

    const products = [
      // Electronics - 官方旗舰店
      {
        name: '高性能笔记本电脑',
        description: '搭载最新处理器，超长续航，适合办公和游戏。',
        price: 5999,
        category: 'Electronics',
        imageUrl: '/images/笔记本电脑.jpg',
        merchant: '官方旗舰店',
        merchantId: null,
        productCode: 'LAPTOP-001',
        stock: 50,
        salesCount: 120,
        searchKeywords: '电脑,笔记本,电脑办公,游戏本,联想,戴尔,华硕,电脑配件,电子产品,办公设备',
        shippingAddress: {
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园'
        }
      },
      {
        name: '无线降噪耳机',
        description: '沉浸式音质体验，主动降噪，舒适佩戴。',
        price: 1299,
        category: 'Electronics',
        imageUrl: '/images/耳机.jpg',
        merchant: '潮流数码',
        merchantId: null,
        productCode: 'HEADPHONE-001',
        stock: 100,
        salesCount: 450,
        searchKeywords: '耳机,降噪耳机,无线耳机,蓝牙耳机,音乐,耳机音响,数码配件,电子设备,音频设备',
        shippingAddress: {
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: 'CBD商务区'
        }
      },
      {
        name: '机械键盘',
        description: '青轴手感，RGB背光，电竞专用。',
        price: 399,
        category: 'Electronics',
        imageUrl: '/images/键盘.jpg',
        merchant: '潮流数码',
        merchantId: null,
        productCode: 'KEYBOARD-001',
        stock: 200,
        salesCount: 300,
        searchKeywords: '键盘,机械键盘,游戏键盘,电竞装备,电脑配件,外设,RGB背光,青轴,茶轴,红轴',
        shippingAddress: {
          province: '上海市',
          city: '上海市',
          district: '浦东新区',
          detail: '张江高科技园区'
        }
      },

      // Clothing
      {
        name: '纯棉T恤',
        description: '100%纯棉，透气舒适，简约百搭。',
        price: 99,
        category: 'Clothing',
        imageUrl: '/images/T恤.jpg',
        merchant: '官方旗舰店',
        merchantId: null,
        productCode: 'TSHIRT-001',
        stock: 300,
        salesCount: 800,
        searchKeywords: 'T恤,纯棉T恤,衣服,服装,上衣,休闲装,夏季服装,百搭单品,男女T恤,时尚服装',
        shippingAddress: {
          province: '浙江省',
          city: '杭州市',
          district: '余杭区',
          detail: '电商产业园'
        }
      },
      {
        name: '牛仔夹克',
        description: '经典复古风格，耐磨耐穿，时尚单品。',
        price: 299,
        category: 'Clothing',
        imageUrl: '/images/牛仔夹克.jpg',
        merchant: '官方旗舰店',
        merchantId: null,
        productCode: 'JACKET-001',
        stock: 150,
        salesCount: 250,
        searchKeywords: '夹克,牛仔夹克,外套,服装,春秋装,时尚单品,复古风,牛仔服,上衣,外套',
        shippingAddress: {
          province: '浙江省',
          city: '杭州市',
          district: '余杭区',
          detail: '电商产业园'
        }
      },

      // Books
      {
        name: '科幻小说集',
        description: '精选年度最佳科幻小说，探索未来世界。',
        price: 59,
        category: 'Books',
        imageUrl: '/images/科幻小说.jpg',
        merchant: '官方旗舰店',
        merchantId: null,
        productCode: 'BOOK-001',
        stock: 500,
        salesCount: 600,
        searchKeywords: '书,书籍,小说,科幻小说,文学,阅读,图书,科幻,未来,故事集,文学作品',
        shippingAddress: {
          province: '江苏省',
          city: '南京市',
          district: '鼓楼区',
          detail: '文化产业园'
        }
      },

      // Home
      {
        name: '简约台灯',
        description: '护眼光源，多档调节，现代简约设计。',
        price: 129,
        category: 'Home',
        imageUrl: '/images/简约台灯.jpg',
        merchant: '潮流数码',
        merchantId: null,
        productCode: 'LAMP-001',
        stock: 180,
        salesCount: 320,
        searchKeywords: '台灯,灯具,照明,护眼台灯,家居装饰,灯具,卧室灯,阅读台灯,LED灯,家居用品',
        shippingAddress: {
          province: '广东省',
          city: '东莞市',
          district: '长安镇',
          detail: '工业区'
        }
      },
      {
        name: '舒适抱枕',
        description: '记忆棉内芯，亲肤面料，支撑颈椎，缓解疲劳。',
        price: 79,
        category: 'Home',
        imageUrl: '/images/抱枕.jpg',
        merchant: '家居良品',
        merchantId: null,
        productCode: 'PILLOW-001',
        stock: 250,
        salesCount: 180,
        searchKeywords: '抱枕,枕头,靠枕,记忆棉,家居装饰,沙发垫,床上用品,颈椎枕,舒适抱枕,家居配件',
        shippingAddress: {
          province: '浙江省',
          city: '杭州市',
          district: '余杭区',
          detail: '家居产业园'
        }
      },
      {
        name: '香薰加湿器',
        description: '超声波雾化，七彩灯光，静音设计，改善室内空气质量。',
        price: 159,
        category: 'Home',
        imageUrl: '/images/香薰加湿器.jpg',
        merchant: '家居良品',
        merchantId: null,
        productCode: 'HUMIDIFIER-001',
        stock: 150,
        salesCount: 220,
        searchKeywords: '加湿器,香薰,空气净化,湿度调节,家居电器,超声波加湿器,静音加湿器,七彩灯,室内加湿,家居小家电',
        shippingAddress: {
          province: '广东省',
          city: '深圳市',
          district: '龙岗区',
          detail: '工业园'
        }
      },
      {
        name: '北欧风花瓶',
        description: '简约北欧设计，陶瓷材质，花艺装饰，提升居家品味。',
        price: 89,
        category: 'Home',
        imageUrl: '/images/北欧风花瓶.jpg',
        merchant: '家居良品',
        merchantId: null,
        productCode: 'VASE-001',
        stock: 200,
        salesCount: 95,
        searchKeywords: '花瓶,花器,北欧风,家居装饰,陶瓷花瓶,插花,花艺装饰,简约花瓶,居家装饰品,装饰品',
        shippingAddress: {
          province: '江苏省',
          city: '苏州市',
          district: '吴中区',
          detail: '工艺园区'
        }
      },
      // New products for merchants
      {
        name: '北欧简约床头柜',
        description: '北欧风格，简约实用，耐用材质。',
        price: 399,
        category: 'Home',
        imageUrl: '/images/北欧床头柜.jpg',
        merchant: '家居良品',
        merchantId: null,
        productCode: 'CABINET-001',
        stock: 120,
        salesCount: 140,
        searchKeywords: '床头柜,柜子,北欧风,简约家具,卧室家具,收纳柜,床头收纳,家居柜,北欧家具,木制家具',
        shippingAddress: { province: '浙江省', city: '杭州市', district: '余杭区', detail: '家居产业园' }
      },
      {
        name: '无线蓝牙音箱',
        description: '便携式音响，重低音，蓝牙5.0连接。',
        price: 299,
        category: 'Electronics',
        imageUrl: '/images/蓝牙音箱.jpg',
        merchant: '潮流数码',
        merchantId: null,
        productCode: 'SPEAKER-001',
        stock: 220,
        salesCount: 460,
        searchKeywords: '音箱,蓝牙音箱,音响,无线音箱,便携音箱,重低音,蓝牙5.0,数码音响,音乐播放器,电子设备',
        shippingAddress: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园' }
      },
      {
        name: '春季印花连衣裙',
        description: '舒适面料，时尚印花，轻盈飘逸。',
        price: 199,
        category: 'Clothing',
        imageUrl: '/images/春季印花连衣裙.jpg',
        merchant: '时尚服饰',
        merchantId: null,
        productCode: 'DRESS-001',
        stock: 180,
        salesCount: 260,
        searchKeywords: '连衣裙,裙子,印花裙,女装,春装,时尚服饰,女性服装,夏季连衣裙,长裙,连衣裙',
        shippingAddress: { province: '浙江省', city: '杭州市', district: '上城区', detail: '商圈' }
      },
      {
        name: '进口香氛蜡烛',
        description: '天然香精，持久留香，提升居家氛围。',
        price: 89,
        category: 'Beauty',
        imageUrl: '/images/香氛蜡烛.jpg',
        merchant: '家居良品',
        merchantId: null,
        productCode: 'CANDLE-001',
        stock: 340,
        salesCount: 95,
        searchKeywords: '蜡烛,香氛蜡烛,香薰,进口蜡烛,家居香氛,香薰蜡烛,天然香精,装饰蜡烛,香氛产品,香氛',
        shippingAddress: { province: '江苏省', city: '南京市', district: '鼓楼区', detail: '文化产业园' }
      },

      // Beauty
      {
        name: '保湿面霜',
        description: '深层补水，长效保湿，适合各种肤质。',
        price: 199,
        category: 'Beauty',
        imageUrl: '/images/面霜.jpg',
        merchant: '官方旗舰店',
        merchantId: null,
        productCode: 'CREAM-001',
        stock: 250,
        salesCount: 400,
        searchKeywords: '面霜,保湿面霜,护肤品,面霜乳液,面部护理,保湿,化妆品,美容产品,护肤霜,面部保湿',
        shippingAddress: {
          province: '上海市',
          city: '上海市',
          district: '奉贤区',
          detail: '美妆产业园'
        }
        }
      ,
      // 额外新增商品
      {
        name: '便携移动电源 20000mAh',
        description: '高密度电芯，双向快充，支持手机与平板多次充电。',
        price: 149,
        category: 'Electronics',
        imageUrl: '/images/充电宝.jpg',
        merchant: '潮流数码',
        productCode: 'POWERBANK-001',
        stock: 400,
        salesCount: 550,
        searchKeywords: '移动电源,充电宝,便携电源,快充,USB-C,20000mAh,数码配件',
        shippingAddress: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园' }
      },
      {
        name: '休闲连帽卫衣',
        description: '加绒舒适，宽松版型，适合日常与运动穿搭。',
        price: 159,
        category: 'Clothing',
        imageUrl: '/images/连帽卫衣.jpg',
        merchant: '时尚服饰',
        productCode: 'HOODIE-001',
        stock: 260,
        salesCount: 320,
        searchKeywords: '卫衣,连帽卫衣,休闲服,运动风,外套,秋冬服装',
        shippingAddress: { province: '浙江省', city: '杭州市', district: '上城区', detail: '商圈' }
      },
      {
        name: '多功能收纳箱（可折叠）',
        description: '防水材质，可折叠，适合衣物与杂物收纳，节省空间。',
        price: 69,
        category: 'Home',
        imageUrl: '/images/多功能收纳箱.jpg',
        merchant: '家居良品',
        productCode: 'STORAGE-001',
        stock: 500,
        salesCount: 700,
        searchKeywords: '收纳箱,收纳,折叠收纳,家居收纳,整理箱,储物盒',
        shippingAddress: { province: '浙江省', city: '杭州市', district: '余杭区', detail: '家居产业园' }
      },
      {
        name: '智能手表（心率+血氧监测）',
        description: '运动追踪与健康监测，支持消息提醒与多种表盘。',
        price: 499,
        category: 'Electronics',
        imageUrl: '/images/智能手表.jpg',
        merchant: '官方旗舰店',
        productCode: 'SMARTWATCH-001',
        stock: 180,
        salesCount: 280,
        searchKeywords: '智能手表,手环,运动手表,心率,血氧,健康监测,智能穿戴',
        shippingAddress: { province: '广东省', city: '深圳市', district: '南山区', detail: '科技园' }
      }
    ];

    // 为每个产品自动填充 merchantId（根据 product.merchant 名称匹配）
    products.forEach(p => {
      if (!p.merchantId) {
        p.merchantId = merchantMap[p.merchant] || null;
      }
    });

    // 清空现有产品数据并重新插入
    await Product.deleteMany({});
    await Product.insertMany(products);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// === 工具函数 ===

// 生成物流轨迹的函数
function generateLogisticsTraces(origin, destination) {
  const traces = [];
  const currentTime = new Date();

  // 揽收
  traces.push({
    time: new Date(currentTime.getTime() - 2 * 24 * 60 * 60 * 1000), // 2天前
    location: `${origin.city}${origin.district}`,
    description: '您的订单已被快递员揽收',
    status: '已揽收'
  });

  // 到达转运中心
  traces.push({
    time: new Date(currentTime.getTime() - 1 * 24 * 60 * 60 * 1000), // 1天前
    location: `${origin.city}转运中心`,
    description: '快件已到达转运中心，正在分拣',
    status: '运输中'
  });

  // 运输途中
  traces.push({
    time: new Date(currentTime.getTime() - 12 * 60 * 60 * 1000), // 12小时前
    location: '运输途中',
    description: '快件正在运输中，请耐心等待',
    status: '运输中'
  });

  // 到达目的地
  traces.push({
    time: new Date(currentTime.getTime() - 6 * 60 * 60 * 1000), // 6小时前
    location: `${destination.city}转运中心`,
    description: '快件已到达目的地转运中心',
    status: '派送中'
  });

  // 派送中
  traces.push({
    time: new Date(currentTime.getTime() - 2 * 60 * 60 * 1000), // 2小时前
    location: `${destination.city}${destination.district}`,
    description: '快递员正在派送，请保持电话畅通',
    status: '派送中'
  });

  return traces;
}

// === 路由 ===

// --- 用户认证路由 ---

// 注册
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: '邮箱已被注册' });

    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    res.status(201).json({ message: '注册成功', user: { id: user._id, name: user.name, role: user.role, balance: user.balance } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 登录
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }

    res.json({
      message: '登录成功',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        balance: user.balance,
        merchantInfo: user.merchantInfo
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 商品路由 ---

// 获取推荐商品（每个分类从销量前3中随机取1个）
app.get('/api/products/recommended', async (req, res) => {
  try {
    // 获取所有分类
    const categories = await Product.distinct('category');

    const recommended = [];

    for (const cat of categories) {
      // 取该分类销量前3
      const top3 = await Product.find({ category: cat })
        .sort({ salesCount: -1, createdAt: -1 })
        .limit(3)
        .populate('merchantId', 'name merchantInfo');

      if (top3 && top3.length > 0) {
        // 随机选一个
        const pick = top3[Math.floor(Math.random() * top3.length)];
        recommended.push(pick);
      }
    }

    res.json(recommended);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取所有商品
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, merchant, sortBy = 'createdAt' } = req.query;

    // 构建查询条件
    const query = {};
    if (category) query.category = category;
    if (merchant) query.merchant = new RegExp(merchant, 'i');

    // 模糊搜索
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { category: new RegExp(search, 'i') },
        { merchant: new RegExp(search, 'i') },
        { productCode: new RegExp(search, 'i') },
        { searchKeywords: new RegExp(search, 'i') }
      ];
    }

    // 排序
    let sort = {};
    switch (sortBy) {
      case 'salesCount':
        sort = { salesCount: -1 };
        break;
      case 'priceAsc':
        sort = { price: 1 };
        break;
      case 'priceDesc':
        sort = { price: -1 };
        break;
      case 'stock':
        sort = { stock: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const products = await Product.find(query)
      .populate('merchantId', 'name merchantInfo')
      .sort(sort);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 按分类获取商品
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category })
      .populate('merchantId', 'name merchantInfo')
      .sort({ salesCount: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 搜索商品（模糊搜索）
app.get('/api/products/search', async (req, res) => {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery) {
      return res.status(400).json({ message: '搜索关键词不能为空' });
    }

    const query = {
      $or: [
        { name: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
        { category: new RegExp(searchQuery, 'i') },
        { merchant: new RegExp(searchQuery, 'i') },
        { productCode: new RegExp(searchQuery, 'i') },
        { searchKeywords: new RegExp(searchQuery, 'i') }
      ]
    };

    const products = await Product.find(query)
      .populate('merchantId', 'name merchantInfo')
      .sort({ salesCount: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个商品
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('merchantId', 'name merchantInfo');
    if (!product) return res.status(404).json({ message: '商品不存在' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 创建商品（商家）
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// --- 地址管理路由 ---

// 获取用户地址列表
app.get('/api/addresses/:userId', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.params.userId }).sort({ isDefault: -1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 添加新地址
app.post('/api/addresses', async (req, res) => {
  try {
    const { userId, isDefault } = req.body;

    // 如果设为默认地址，先取消其他默认地址
    if (isDefault) {
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
    }

    const newAddress = new Address(req.body);
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 更新地址
app.put('/api/addresses/:id', async (req, res) => {
  try {
    const { isDefault, userId } = req.body;

    // 如果设为默认地址，先取消其他默认地址
    if (isDefault) {
      await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedAddress) return res.status(404).json({ message: '地址不存在' });
    res.json(updatedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 删除地址
app.delete('/api/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ message: '地址不存在' });
    res.json({ message: '地址已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 订单路由 ---

// 创建订单（原子性事务处理 - 已降级为普通操作以支持单节点MongoDB）
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items, shippingAddress, remarks } = req.body;

    // 验证用户
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 计算总金额并检查库存
    let total = 0;
    const populatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`商品 ${item.productId} 不存在`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`商品 ${product.name} 库存不足，当前库存: ${product.stock}`);
      }

      // 添加商家信息到订单项
      populatedItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl,
        merchant: product.merchant,
        merchantId: product.merchantId
      });

      total += product.price * item.quantity;

      // 扣减库存
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save();
    }

    // 检查用户余额
    if (user.balance < total) {
      throw new Error('余额不足，请充值');
    }

    // 扣减用户余额
    user.balance -= total;
    await user.save();

    // 更新商家销售额
    for (const item of populatedItems) {
      if (item.merchantId) {
        await User.findByIdAndUpdate(
          item.merchantId,
          { $inc: { 'merchantInfo.totalSales': item.quantity } }
        );
      }
    }

    // 创建订单
    const newOrder = new Order({
      userId,
      items: populatedItems,
      total,
      status: '已支付',
      shippingAddress,
      remarks,
      paymentInfo: {
        method: '余额支付',
        paidAt: new Date(),
        transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`
      }
    });

    const savedOrder = await newOrder.save();

    // 创建物流信息
    const logistics = new Logistics({
      orderId: savedOrder._id,
      carrier: '顺丰速运',
      origin: populatedItems[0]?.merchantId ? {
        province: '广东省',
        city: '深圳市',
        district: '南山区',
        detail: '科技园'
      } : {
        province: '广东省',
        city: '广州市',
        district: '天河区',
        detail: '电商产业园'
      },
      destination: shippingAddress,
      status: '已揽收',
      traces: generateLogisticsTraces(
        {
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: '科技园'
        },
        shippingAddress
      ),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3天后
    });

    await logistics.save();

    res.status(201).json({
      order: savedOrder,
      logistics: logistics,
      message: '订单创建成功'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({ message: error.message });
  }
});

// 获取用户订单
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('items.productId', 'name imageUrl')
      .populate('items.merchantId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个订单详情
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl')
      .populate('items.merchantId', 'name merchantInfo');

    if (!order) return res.status(404).json({ message: '订单不存在' });

    // 获取物流信息
    const logistics = await Logistics.findOne({ orderId: order._id });

    res.json({
      order,
      logistics
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取订单物流信息
app.get('/api/logistics/:orderId', async (req, res) => {
  try {
    const logistics = await Logistics.findOne({ orderId: req.params.orderId })
      .populate('orderId', 'orderNumber');

    if (!logistics) return res.status(404).json({ message: '物流信息不存在' });

    res.json(logistics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 更新订单状态
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: '订单不存在' });

    // 如果订单状态变为发货中，更新物流状态
    if (status === '发货中') {
      await Logistics.findOneAndUpdate(
        { orderId: order._id },
        { status: '运输中' }
      );
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 支付订单
app.post('/api/orders/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    
    if (order.status !== '待支付') {
      return res.status(400).json({ message: '订单状态不正确，无法支付' });
    }

    order.status = '已支付';
    order.paymentInfo = {
      method: '在线支付',
      paidAt: new Date(),
      transactionId: `PAY${Date.now()}`
    };
    
    await order.save();
    res.json({ message: '支付成功', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 取消订单
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    
    if (order.status !== '待支付') {
      return res.status(400).json({ message: '只能取消待支付的订单' });
    }

    // 恢复库存 (简单实现，不考虑并发)
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { 
        $inc: { stock: item.quantity, salesCount: -item.quantity } 
      });
    }

    order.status = '已取消';
    await order.save();
    res.json({ message: '订单已取消', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 确认收货
app.post('/api/orders/:id/confirm', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '订单不存在' });
    
    order.status = '已完成';
    
    // 更新物流状态
    await Logistics.findOneAndUpdate(
      { orderId: order._id },
      { status: '已签收', deliveredAt: new Date() }
    );

    await order.save();
    res.json({ message: '确认收货成功', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除订单
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '订单不存在' });

    await Order.findByIdAndDelete(req.params.id);
    // 同时删除关联的物流信息
    await Logistics.findOneAndDelete({ orderId: req.params.id });

    res.json({ message: '订单已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 申请退款
app.post('/api/orders/:id/refund', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: '订单不存在' });

    if (!['已支付', '发货中'].includes(order.status)) {
      return res.status(400).json({ message: '当前订单状态无法申请退款' });
    }

    // 这里简化处理，直接将状态改为已退款，实际业务中可能需要审核流程
    order.status = '已退款';
    
    // 如果是余额支付，应该退还余额
    if (order.paymentInfo.method === '余额支付') {
      const user = await User.findById(order.userId);
      if (user) {
        user.balance += order.total;
        await user.save();
      }
    }

    // 恢复库存
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, { 
        $inc: { stock: item.quantity, salesCount: -item.quantity } 
      });
    }

    await order.save();
    res.json({ message: '退款申请成功，金额已退回', order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 商家路由 ---

// 获取商家列表
app.get('/api/merchants', async (req, res) => {
  try {
    const merchants = await User.find({ role: 'merchant' })
      .select('name email merchantInfo')
      .sort({ 'merchantInfo.totalSales': -1 });

    res.json(merchants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取单个商家详情
app.get('/api/merchants/:id', async (req, res) => {
  try {
    const merchant = await User.findOne({ _id: req.params.id, role: 'merchant' })
      .select('name email merchantInfo');
    if (!merchant) return res.status(404).json({ message: '商家不存在' });
    res.json(merchant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 按商家搜索商品
app.get('/api/products/merchant/:merchantId', async (req, res) => {
  try {
    const { merchantId } = req.params;
    const products = await Product.find({ merchantId })
      .populate('merchantId', 'name merchantInfo')
      .sort({ salesCount: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 聚合操作路由 ---

// 商品统计
app.get('/api/analytics/products', async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
          totalSales: { $sum: '$salesCount' }
        }
      }
    ]);

    const topProducts = await Product.find()
      .sort({ salesCount: -1 })
      .limit(10)
      .populate('merchantId', 'name');

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .sort({ stock: 1 });

    res.json({
      categoryStats: stats,
      topProducts,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 订单统计
app.get('/api/analytics/orders', async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
        break;
      case 'week':
        dateFormat = { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
        break;
      case 'month':
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
        break;
      default:
        dateFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    }

    const revenueByPeriod = await Order.aggregate([
      {
        $group: {
          _id: dateFormat,
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const statusStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      revenueByPeriod,
      statusStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- 管理员路由 ---

// 获取所有订单（管理员）
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const query = {};
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 获取所有用户（管理员）
app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 删除用户（管理员）
app.delete('/api/admin/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: '用户不存在' });
    res.json({ message: '用户已删除' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Admin Account: 12345@123.com / 12345');
});