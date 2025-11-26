# 简易电商平台实验报告

## 一、实验名称
基于 Node.js + MongoDB 的简易电商平台设计与实现

## 二、实验目的
1.  掌握 Node.js 和 Express 框架的基本使用方法，构建 RESTful API。
2.  熟悉 MongoDB 数据库及 Mongoose ODM 的使用，进行数据建模和 CRUD 操作。
3.  理解电商系统的核心业务逻辑，包括用户管理、商品展示、购物车、订单处理和物流追踪。
4.  学习前后端分离的开发模式，实现前端页面与后端接口的数据交互。
5.  掌握数据库事务（Transaction）在订单处理等关键业务中的应用，保证数据一致性。

## 三、实验环境
*   **操作系统**: Windows
*   **开发工具**: Visual Studio Code
*   **运行环境**: Node.js (v14+), npm
*   **数据库**: MongoDB (v4.0+)
*   **后端框架**: Express.js
*   **数据库工具**: Mongoose
*   **前端技术**: HTML5, CSS3, JavaScript (原生)

## 四、系统设计

### 4.1 系统架构
本系统采用典型的 B/S (Browser/Server) 架构，前后端分离设计。
*   **前端**: 负责页面展示和用户交互，通过 Fetch API 调用后端接口。
*   **后端**: 基于 Express 框架提供 RESTful API，处理业务逻辑。
*   **数据库**: 使用 MongoDB 存储用户、商品、订单、物流等数据。

### 4.2 功能模块
系统主要包含以下功能模块：
1.  **用户模块**: 注册、登录、个人信息管理、收货地址管理、余额充值。
2.  **商品模块**: 商品列表展示、商品详情、分类筛选、关键词模糊搜索、销量统计。
3.  **购物车模块**: 添加商品、数量调整、选中结算（前端实现）。
4.  **订单模块**: 订单创建（原子性操作）、订单支付（余额扣除）、订单取消、订单状态流转。
5.  **物流模块**: 模拟物流轨迹生成、物流状态查询。
6.  **商家/管理员模块**: 商品发布、订单管理、用户管理（基础功能）。

### 4.3 数据库设计 (Schema)
系统主要包含以下数据模型：

1.  **User (用户)**
    *   `name`: 用户名
    *   `email`: 邮箱 (唯一标识)
    *   `password`: 密码
    *   `role`: 角色 (user/merchant/admin)
    *   `balance`: 余额
    *   `merchantInfo`: 商家信息 (仅商家角色)

2.  **Product (商品)**
    *   `name`: 商品名称
    *   `price`: 价格
    *   `stock`: 库存
    *   `category`: 分类
    *   `salesCount`: 销量
    *   `merchantId`: 关联商家
    *   `searchKeywords`: 搜索关键词

3.  **Order (订单)**
    *   `userId`: 关联用户
    *   `items`: 订单商品列表 (快照)
    *   `total`: 总金额
    *   `status`: 订单状态 (待支付/已支付/发货中/已完成/已取消)
    *   `shippingAddress`: 收货地址快照

4.  **Logistics (物流)**
    *   `orderId`: 关联订单
    *   `trackingNumber`: 物流单号
    *   `traces`: 物流轨迹数组 (时间、地点、状态)

5.  **Address (地址)**
    *   `userId`: 关联用户
    *   `province/city/district/detail`: 详细地址信息
    *   `isDefault`: 是否默认地址

## 五、功能实现详解

### 5.1 数据库连接与初始化
在 `server.js` 中使用 Mongoose 连接 MongoDB，并实现了 `seedDatabase` 函数。该函数在服务器启动时检查并初始化默认的管理员账户、商家账户以及初始商品数据，确保系统有一套完整的演示数据。

### 5.2 商品展示与搜索
*   **列表页**: 支持按分类筛选、按价格/销量排序。
*   **搜索**: 实现了基于正则表达式的模糊搜索，支持搜索商品名、描述、分类及预设的 `searchKeywords`。
*   **详情页**: 展示商品详细信息、库存状态、所属商家，并提供购买入口。

### 5.3 订单创建与事务处理
订单创建是电商系统的核心，为了保证数据的一致性（库存扣减、余额扣除、订单生成必须同时成功或同时失败），使用了 MongoDB 的 **Session** 和 **Transaction**。
*   **步骤**:
    1.  开启事务 session。
    2.  检查商品库存，库存不足抛出异常。
    3.  计算总价，检查用户余额。
    4.  扣减商品库存，增加商品销量。
    5.  扣减用户余额。
    6.  创建 Order 文档。
    7.  创建初始 Logistics 文档。
    8.  提交事务 (commitTransaction)。
    9.  若任一步骤出错，回滚事务 (abortTransaction)。

### 5.4 物流模拟
系统内置了一个 `generateLogisticsTraces` 函数，根据发货地和收货地，自动生成一组模拟的物流轨迹数据（包含揽收、转运、派送等状态），并在订单创建时初始化，模拟真实的物流体验。

## 六、核心代码展示

### 6.1 订单创建事务 (server.js)
```javascript
// 创建订单（原子性事务处理）
app.post('/api/orders', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // ... (省略参数获取)

    // 循环处理商品项，检查库存并扣减
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (product.stock < item.quantity) {
        throw new Error(\`商品 \${product.name} 库存不足\`);
      }
      product.stock -= item.quantity;
      product.salesCount += item.quantity;
      await product.save({ session });
      // ...
    }

    // 检查并扣减余额
    if (user.balance < total) {
      throw new Error('余额不足');
    }
    user.balance -= total;
    await user.save({ session });

    // 保存订单和物流
    await newOrder.save({ session });
    await logistics.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: '订单创建成功' });

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ message: error.message });
  } finally {
    session.endSession();
  }
});
```

### 6.2 商品模糊搜索
```javascript
const query = {
  $or: [
    { name: new RegExp(searchQuery, 'i') },
    { description: new RegExp(searchQuery, 'i') },
    { category: new RegExp(searchQuery, 'i') },
    { searchKeywords: new RegExp(searchQuery, 'i') }
  ]
};
const products = await Product.find(query);
```

## 七、实验结果
1.  **启动**: 运行 `npm start`，服务器成功启动在 3000 端口，并自动连接数据库初始化数据。
2.  **浏览**: 访问 `http://localhost:3000`，可以看到首页推荐商品和分类导航。
3.  **购物流程**:
    *   用户注册/登录成功。
    *   点击商品进入详情页，点击“立即购买”或加入购物车。
    *   在结算页选择地址，点击支付。
    *   系统提示支付成功，跳转至订单列表。
4.  **数据验证**:
    *   查看数据库，商品库存已对应减少，销量增加。
    *   用户余额已扣除对应金额。
    *   订单状态显示为“已支付”，并能查看到模拟的物流信息。

## 八、实验总结
通过本次实验，成功构建了一个具备核心功能的简易电商平台。
*   **收获**:
    *   深入理解了 Node.js 异步编程模型和 Express 中间件机制。
    *   熟练掌握了 MongoDB 的数据建模，特别是如何处理关联数据（如订单与用户、商品的关系）。
    *   实践了数据库事务的重要性，解决了并发场景下的超卖和资金安全问题。
    *   提升了前端页面与后端 API 交互的调试能力。
*   **不足与改进**:
    *   目前支付仅支持余额支付，未来可接入第三方支付 SDK。
    *   前端页面交互可进一步优化，例如增加加载动画、更友好的错误提示。
    *   可以增加更复杂的权限控制中间件，增强系统安全性。
