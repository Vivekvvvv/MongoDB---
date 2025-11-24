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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

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

    // 创建默认商家用户
    const merchants = [
      {
        name: '官方旗舰店',
        email: 'merchant1@shop.com',
        password: '123456',
        role: 'merchant',
        merchantInfo: {
          shopName: '官方旗舰店',
          shopDescription: '官方正品，品质保证',
          contactPhone: '400-888-8888'
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
          contactPhone: '400-999-9999'
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

    // 获取商家ID用于商品创建
    const merchant1 = await User.findOne({ email: 'merchant1@shop.com' });
    const merchant2 = await User.findOne({ email: 'merchant2@shop.com' });

    // Seed Products
    const productCount = await Product.countDocuments();
    const homeCount = await Product.countDocuments({ category: 'Home' });
    const beautyCount = await Product.countDocuments({ category: 'Beauty' });

    // 获取供应商用户
    const suppliers = await User.find({ role: 'merchant' });
    const appleSupplier = suppliers.find(s => s.name === 'Apple官方供应商');
    const xiaomiSupplier = suppliers.find(s => s.name === '小米官方供应商');
    const dysonSupplier = suppliers.find(s => s.name === '戴森官方供应商');
    const sonySupplier = suppliers.find(s => s.name === 'Sony官方供应商');
    const lenovoSupplier = suppliers.find(s => s.name === '联想官方供应商');

    const products = [
      // Electronics
      {
        name: '高性能笔记本电脑',
        description: '搭载最新处理器，超长续航，适合办公和游戏。',
        price: 5999,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww',
        merchant: '官方旗舰店',
        merchantId: merchant1 ? merchant1._id : null,
        productCode: 'LAPTOP-001',
        stock: 50,
        salesCount: 128
      },
      {
        name: '无线降噪耳机',
        description: '沉浸式音质体验，主动降噪，舒适佩戴。',
        price: 1299,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D',
        salesCount: 89
      },
      {
        name: '机械键盘',
        description: '青轴手感，RGB背光，电竞专用。',
        price: 399,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D',
        supplier: 'Apple官方供应商',
        supplierId: appleSupplier ? appleSupplier._id : null,
        merchant: '官方旗舰店',
        merchantId: merchant1 ? merchant1._id : null
      },
      {
        name: '智能手表',
        description: '健康监测，运动模式，超长待机。',
        price: 899,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHNtYXJ0d2F0Y2h8ZW58MHx8MHx8fDA%3D'
      },
      {
        name: '4K显示器',
        description: '超高清画质，色彩精准，专业设计首选。',
        price: 2499,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bW9uaXRvcnxlbnwwfHwwfHx8MA%3D%3D'
      },
      
      // Clothing
      {
        name: '纯棉T恤',
        description: '100%纯棉，透气舒适，简约百搭。',
        price: 99,
        category: 'Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHNoaXJ0fGVufDB8fDB8fHww'
      },
      {
        name: '牛仔夹克',
        description: '经典复古风格，耐磨耐穿，时尚单品。',
        price: 299,
        category: 'Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8amFja2V0fGVufDB8fDB8fHww'
      },
      {
        name: '运动跑鞋',
        description: '轻盈透气，缓震鞋底，助力畅跑。',
        price: 459,
        category: 'Clothing',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D',
        salesCount: 156
      },

      // Books
      {
        name: '科幻小说集',
        description: '精选年度最佳科幻小说，探索未来世界。',
        price: 59,
        category: 'Books',
        imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJvb2t8ZW58MHx8MHx8fDA%3D'
      },
      {
        name: '编程入门指南',
        description: '零基础学习编程，涵盖Python, JavaScript等。',
        price: 79,
        category: 'Books',
        imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Ym9va3xlbnwwfHwwfHx8MA%3D%3D'
      },

      // Home
      {
        name: '简约台灯',
        description: '护眼光源，多档调节，现代简约设计。',
        price: 129,
        category: 'Home',
        imageUrl: 'https://images.unsplash.com/photo-1507473888900-52e1adad5420?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFtcHxlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        name: '舒适抱枕',
        description: '柔软亲肤，多种颜色可选，居家必备。',
        price: 49,
        category: 'Home',
        imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGlsbG93fGVufDB8fDB8fHww'
      },
      {
        name: '香薰加湿器',
        description: '静音加湿，七彩夜灯，舒缓身心。',
        price: 89,
        category: 'Home',
        imageUrl: 'https://images.unsplash.com/photo-1608508644127-513d488a87cd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aHVtaWRpZmllcnxlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        name: '北欧风花瓶',
        description: '陶瓷材质，简约线条，插花装饰首选。',
        price: 69,
        category: 'Home',
        imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792ca11df53?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dmFzZXxlbnwwfHwwfHx8MA%3D%3D'
      },

      // Beauty
      {
        name: '保湿面霜',
        description: '深层补水，长效保湿，适合各种肤质。',
        price: 199,
        category: 'Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y3JlYW18ZW58MHx8MHx8fDA%3D'
      },
      {
        name: '香水套装',
        description: '清新花果香调，持久留香，送礼佳品。',
        price: 399,
        category: 'Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVyZnVtZXxlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        name: '哑光口红',
        description: '丝绒质地，显色持久，提升气色。',
        price: 159,
        category: 'Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGlwc3RpY2t8ZW58MHx8MHx8fDA%3D'
      },
      {
        name: '眼影盘',
        description: '大地色系，粉质细腻，日常百搭。',
        price: 129,
        category: 'Beauty',
        imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZXllc2hhZG93fGVufDB8fDB8fHww'
      }
    ];

    if (productCount === 0) {
      await Product.insertMany(products);
      console.log('All sample products seeded');
    } else {
      // Check and add missing categories
      const newProducts = [];
      if (homeCount === 0) {
        newProducts.push(...products.filter(p => p.category === 'Home'));
      }
      if (beautyCount === 0) {
        newProducts.push(...products.filter(p => p.category === 'Beauty'));
      }
      
      if (newProducts.length > 0) {
        await Product.insertMany(newProducts);
        console.log('Added missing category products');
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Routes

// --- Auth Routes ---

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Simple validation
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: '邮箱已被注册' });

    // Force role to 'user'
    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    res.status(201).json({ message: '注册成功', user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
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
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Product Routes ---

// Get all products with sorting and filtering
app.get('/api/products', async (req, res) => {
  try {
    const { sortBy = 'createdAt', category, search } = req.query;
    let query = {};

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Define sort options
    let sortOption = {};
    switch (sortBy) {
      case 'priceAsc':
        sortOption = { price: 1 };
        break;
      case 'priceDesc':
        sortOption = { price: -1 };
        break;
      case 'salesCount':
        sortOption = { salesCount: -1 };
        break;
      case 'stock':
        sortOption = { stock: -1 };
        break;
      case 'createdAt':
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const products = await Product.find(query)
      .populate('merchantId', 'username merchantInfo')
      .populate('supplierId', 'username merchantInfo')
      .sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get recommended products (based on sales and stock)
app.get('/api/products/recommended', async (req, res) => {
  try {
    const products = await Product.find({
      stock: { $gt: 0 }, // Only show products with stock
      salesCount: { $gte: 5 } // Only products with sales >= 5
    })
    .populate('merchantId', 'username merchantInfo')
    .populate('supplierId', 'username merchantInfo')
    .sort({ salesCount: -1, stock: -1 }) // Sort by sales, then by stock
    .limit(8); // Limit to 8 recommendations

    // If not enough products meet criteria, add some with stock
    if (products.length < 8) {
      const additionalProducts = await Product.find({
        _id: { $nin: products.map(p => p._id) },
        stock: { $gt: 0 }
      })
      .populate('merchantId', 'username merchantInfo')
      .populate('supplierId', 'username merchantInfo')
      .sort({ createdAt: -1 })
      .limit(8 - products.length);

      products.push(...additionalProducts);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search products endpoint
app.get('/api/products/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { merchant: { $regex: q, $options: 'i' } },
        { supplier: { $regex: q, $options: 'i' } }
      ]
    })
    .populate('merchantId', 'username merchantInfo')
    .populate('supplierId', 'username merchantInfo')
    .sort({ salesCount: -1, stock: -1 })
    .limit(10);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod = '余额支付', remarks = '' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: '订单商品不能为空' });
    }

    // 计算总价
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // 获取商品详情
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== items.length) {
      return res.status(400).json({ message: '部分商品不存在' });
    }

    // 检查库存
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `商品 "${item.name}" 库存不足，当前库存: ${product?.stock || 0}`
        });
      }
    }

    // 创建订单
    const orderItems = items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        merchant: product.merchant,
        merchantId: product.merchantId,
        imageUrl: product.imageUrl
      };
    });

    // 根据支付方式设置订单状态
    const isPaid = paymentMethod === '免支付' || paymentMethod === '余额支付';

    const newOrder = new Order({
      userId: req.body.userId || null, // 应该从认证中间件获取
      items: orderItems,
      total,
      shippingAddress,
      paymentInfo: {
        method: paymentMethod,
        paidAt: isPaid ? new Date() : null,
        transactionId: isPaid ? `FREE${Date.now()}${Math.floor(Math.random() * 1000)}` : null
      },
      status: isPaid ? '待发货' : '待支付',
      remarks
    });

    const savedOrder = await newOrder.save();

    // 如果已支付（包括免支付），则更新库存
    if (isPaid) {
      for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity, salesCount: item.quantity }
        });
      }
    }

    // 如果是免支付，自动创建物流信息
    if (paymentMethod === '免支付') {
      // 获取第一个商品的发货地址作为物流起始地址
      const firstProduct = products[0];

      // 创建物流信息
      const Logistics = require('./models/Logistics');
      const logistics = new Logistics({
        orderId: savedOrder._id,
        company: '顺丰快递',
        trackingNumber: `SF${Date.now()}${Math.floor(Math.random() * 1000)}`,
        origin: {
          province: firstProduct.shippingAddress.province,
          city: firstProduct.shippingAddress.city,
          district: firstProduct.shippingAddress.district,
          detail: firstProduct.shippingAddress.detail
        },
        destination: shippingAddress,
        status: '已发货',
        createdAt: new Date(),
        shippedAt: new Date()
      });

      const savedLogistics = await logistics.save();

      // 返回订单和物流信息
      res.status(201).json({
        order: savedOrder,
        logistics: savedLogistics,
        message: '订单创建成功，已自动安排发货'
      });
    } else {
      // 普通支付方式，只返回订单信息
      res.status(201).json({
        order: savedOrder,
        message: '订单创建成功'
      });
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    // 在实际应用中，应该根据当前登录用户筛选
    // const userId = req.user.id; // 需要认证中间件
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl')
      .populate('items.merchantId', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'name imageUrl')
      .populate('items.merchantId', 'name');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pay order
app.post('/api/orders/:id/pay', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== '待支付') {
      return res.status(400).json({ message: '订单状态不允许支付' });
    }

    // 更新订单状态和支付信息
    order.status = '已支付';
    order.paymentInfo.paidAt = new Date();
    order.paymentInfo.transactionId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;

    await order.save();

    // 更新库存
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, salesCount: item.quantity }
      });
    }

    res.json({ message: '支付成功', order });
  } catch (error) {
    console.error('支付失败:', error);
    res.status(400).json({ message: error.message });
  }
});

// Cancel order
app.post('/api/orders/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== '待支付') {
      return res.status(400).json({ message: '只有待支付订单可以取消' });
    }

    order.status = '已取消';
    await order.save();

    res.json({ message: '订单已取消', order });
  } catch (error) {
    console.error('取消订单失败:', error);
    res.status(400).json({ message: error.message });
  }
});

// Ship order
app.post('/api/orders/:id/ship', async (req, res) => {
  try {
    const { company, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== '已支付') {
      return res.status(400).json({ message: '只有已支付订单可以发货' });
    }

    order.status = '发货中';
    order.logistics = {
      company: company || '顺丰快递',
      trackingNumber: trackingNumber || `SF${Date.now()}${Math.floor(Math.random() * 1000)}`,
      shippedAt: new Date(),
      status: '已发货'
    };

    await order.save();

    res.json({ message: '订单已发货', order });
  } catch (error) {
    console.error('发货失败:', error);
    res.status(400).json({ message: error.message });
  }
});

// Confirm order received
app.post('/api/orders/:id/confirm', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.status !== '发货中') {
      return res.status(400).json({ message: '只有发货中订单可以确认收货' });
    }

    order.status = '已完成';
    if (order.logistics) {
      order.logistics.status = '已签收';
      order.logistics.deliveredAt = new Date();
    }

    await order.save();

    res.json({ message: '确认收货成功', order });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(400).json({ message: error.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- Address Routes ---

// Get user addresses
app.get('/api/addresses', async (req, res) => {
  try {
    // 在实际应用中，应该根据当前登录用户筛选
    // const userId = req.user.id; // 需要认证中间件
    const addresses = await Address.find().sort({ order: 1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get addresses by userId
app.get('/api/addresses/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, order: 1, createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new address
app.post('/api/addresses', async (req, res) => {
  try {
    const { userId, ...addressData } = req.body;

    // If this is default, unset other default addresses
    if (addressData.isDefault) {
      await Address.updateMany({ userId }, { isDefault: false });
    }

    // Get the highest order for this user and set new order
    const maxOrder = await Address.findOne({ userId }).sort({ order: -1 });
    addressData.order = maxOrder ? maxOrder.order + 1 : 1;

    const address = new Address({ userId, ...addressData });
    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update address
app.put('/api/addresses/:id', async (req, res) => {
  try {
    const { userId, ...addressData } = req.body;

    // If this is default, unset other default addresses
    if (addressData.isDefault) {
      await Address.updateMany({ userId, _id: { $ne: req.params.id } }, { isDefault: false });
    }

    const address = await Address.findByIdAndUpdate(
      req.params.id,
      addressData,
      { new: true, runValidators: true }
    );

    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update address order
app.put('/api/addresses/:id/order', async (req, res) => {
  try {
    const { order } = req.body;
    const address = await Address.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true, runValidators: true }
    );

    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update addresses order (bulk update)
app.put('/api/addresses/reorder', async (req, res) => {
  try {
    const { addresses } = req.body; // array of [{id, order}]

    const bulkOps = addresses.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order }
      }
    }));

    await Address.bulkWrite(bulkOps);
    res.json({ message: 'Address order updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete address
app.delete('/api/addresses/:id', async (req, res) => {
  try {
    const address = await Address.findByIdAndDelete(req.params.id);
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
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
});
