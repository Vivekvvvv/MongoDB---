# 简易电商平台 - 快速开始

## 🚀 快速启动

### 方法一：使用增强版启动脚本（推荐）

```bash
# 确保MongoDB已启动
mongod

# 启动增强版电商平台（会自动更新商品库存）
npm run start-enhanced
```

### 方法二：手动启动

```bash
# 1. 先更新商品库存
npm run update-stock

# 2. 启动增强版服务器
npm run start-enhanced
```

### 方法三：开发模式

```bash
# 开发模式启动（使用nodemon自动重启）
npm run dev-enhanced
```

## 🌐 访问应用

- **前端地址：** http://localhost:3000
- **默认管理员账户：** 12345@123.com / 12345
- **默认商家账户：** merchant1@shop.com / 123456

## ✨ 主要改进

1. **✅ 删除了首页的订单弹窗** - 页面更加简洁
2. **✅ 为所有商品添加了库存** - 支持库存管理
3. **✅ 智能推荐系统** - 首页显示推荐商品
4. **✅ 物流跟踪** - 完整的物流信息模拟
5. **✅ 地址管理** - 用户收货地址管理
6. **✅ 模糊搜索** - 支持多维度搜索

## 📦 新增文件说明

- `server-enhanced.js` - 增强版服务器（支持所有新功能）
- `app-enhanced.js` - 增强版前端JS
- `style-enhanced.css` - 增强版样式
- `update-stock.js` - 库存更新脚本
- `start-enhanced.js` - 启动脚本

## 🛠️ 常用命令

```bash
# 更新商品库存
npm run update-stock

# 启动原始版本
npm start

# 启动增强版本
npm run start-enhanced

# 开发模式（增强版）
npm run dev-enhanced
```

## 🎯 核心功能

### 商品管理
- ✅ 所有商品都有库存
- ✅ 智能推荐算法
- ✅ 商家信息展示
- ✅ 销量统计

### 用户功能
- ✅ 地址管理
- ✅ 购物车优化
- ✅ 订单跟踪
- ✅ 物流查询

### 搜索功能
- ✅ 模糊搜索
- ✅ 实时建议
- ✅ 分类筛选
- ✅ 同类商品推荐

## 📱 UI/UX 改进

- 现代化设计风格
- 响应式布局
- 动画过渡效果
- 移动端优化

---

**注意：** 确保先启动MongoDB数据库，然后再启动电商平台。