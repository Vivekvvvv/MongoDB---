require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

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

    // Seed Products
    const productCount = await Product.countDocuments();
    const homeCount = await Product.countDocuments({ category: 'Home' });
    const beautyCount = await Product.countDocuments({ category: 'Beauty' });

    const products = [
      // Electronics
      {
        name: '高性能笔记本电脑',
        description: '搭载最新处理器，超长续航，适合办公和游戏。',
        price: 5999,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGFwdG9wfGVufDB8fDB8fHww'
      },
      {
        name: '无线降噪耳机',
        description: '沉浸式音质体验，主动降噪，舒适佩戴。',
        price: 1299,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D'
      },
      {
        name: '机械键盘',
        description: '青轴手感，RGB背光，电竞专用。',
        price: 399,
        category: 'Electronics',
        imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2V5Ym9hcmR8ZW58MHx8MHx8fDA%3D'
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
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2hvZXN8ZW58MHx8MHx8fDA%3D'
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

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
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

// Create a new order (Simple checkout simulation)
app.post('/api/orders', async (req, res) => {
  try {
    const { items, total } = req.body;
    const newOrder = new Order({
      items,
      total,
      status: '已支付'
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all orders (Admin/User history)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
