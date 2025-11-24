// Enhanced E-commerce App with Advanced Features
const productList = document.getElementById('productList');
const recommendedList = document.getElementById('recommendedList');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');
const searchInput = document.getElementById('searchInput');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let allProducts = [];
let recommendedProducts = [];
let currentUser = null;

// API Base URL
const API_BASE = '/api';

// Check login status on load
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html')) return;

    // 修复购物车数据
    cart = repairCartData();

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }
    currentUser = JSON.parse(userStr);

    updateUIForUser();

    // Load recommended products first
    if (document.getElementById('recommendedList')) {
        loadRecommendedProducts();
    }

    // Load all products
    if (document.getElementById('productList')) {
        loadProducts();
    }

    updateCartUI();
});

// Search functionality
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchProducts();
        } else {
            // 实时搜索建议
            realTimeSearch();
        }
    });
}

// Load recommended products
async function loadRecommendedProducts() {
    try {
        const response = await fetch(`${API_BASE}/products/recommended`);
        const products = await response.json();
        recommendedProducts = products;
        displayRecommendedProducts(products);
    } catch (error) {
        console.error('加载推荐商品失败:', error);
        document.getElementById('recommendedList').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #e74c3c;"></i>
                <p style="margin-top: 15px; color: #7f8c8d;">加载推荐商品失败，请刷新页面重试</p>
            </div>
        `;
    }
}

// 修复现有购物车数据的函数
function repairCartData() {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    let repaired = false;

    cart = cart.map(item => {
        // 确保每个项目都有正确的ID字段
        if (item.productId && !item._id) {
            item._id = item.productId;
            repaired = true;
        }
        if (item.productId && !item.id) {
            item.id = item.productId;
            repaired = true;
        }
        return item;
    });

    if (repaired) {
        localStorage.setItem('cart', JSON.stringify(cart));
        console.log('🔧 购物车数据已修复');
    }

    return cart;
}

// Load all products with sorting
async function loadProducts(sortBy = 'createdAt') {
    try {
        console.log(`🔄 加载商品，排序方式: ${sortBy}`);
        const category = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : '';
        let url = `${API_BASE}/products?sortBy=${sortBy}`;
        if (category) url += `&category=${category}`;

        console.log(`📡 请求URL: ${url}`);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const products = await response.json();
        console.log(`✅ 成功加载 ${products.length} 个商品`);

        // 验证商品数据
        const validProducts = products.filter(p => p && p._id && p.name);
        if (validProducts.length !== products.length) {
            console.warn(`⚠️ 发现 ${products.length - validProducts.length} 个无效商品数据`);
        }

        allProducts = validProducts;

        // 显示排序信息
        if (sortBy !== 'createdAt') {
            console.log(`📊 商品排序示例 (前3个):`);
            validProducts.slice(0, 3).forEach((p, i) => {
                console.log(`  ${i + 1}. ${p.name}: ¥${p.price}, 库存: ${p.stock || 0}, 销量: ${p.salesCount || 0}`);
            });
        }

        displayProducts(validProducts);
    } catch (error) {
        console.error('❌ 加载商品失败:', error);
        document.getElementById('productList').innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle" style="font-size: 2em; color: #e74c3c;"></i>
                <h3 style="color: #e74c3c; margin: 10px 0;">加载商品失败</h3>
                <p style="margin-top: 10px; color: #7f8c8d;">错误信息: ${error.message}</p>
                <button onclick="loadProducts('${sortBy}')" style="margin-top: 15px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    <i class="fas fa-redo"></i> 重试
                </button>
            </div>
        `;
    }
}

// Display recommended products
function displayRecommendedProducts(products) {
    if (!recommendedList) return;

    if (products.length === 0) {
        recommendedList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 2em; color: #95a5a6;"></i>
                <p style="margin-top: 15px; color: #7f8c8d;">暂无推荐商品</p>
            </div>
        `;
        return;
    }

    recommendedList.innerHTML = products.map(product => createProductCard(product, true)).join('');
}

// Display products with enhanced info
function displayProducts(products) {
    if (!productList) return;

    if (products.length === 0) {
        productList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 2em; color: #95a5a6;"></i>
                <p style="margin-top: 15px; color: #7f8c8d;">未找到匹配的商品</p>
            </div>
        `;
        return;
    }

    productList.innerHTML = products.map(product => createProductCard(product, false)).join('');
}

// Enhanced product card creation
function createProductCard(product, isRecommended = false) {
    const merchantInfo = product.merchantId ? product.merchantId.merchantInfo : null;
    const supplierInfo = product.supplierId ? product.supplierId.merchantInfo : null;
    const rating = supplierInfo ? supplierInfo.rating || 5 : (merchantInfo ? merchantInfo.rating || 5 : 5);

    // 安全获取库存值
    const stock = product.stock || 0;
    const salesCount = product.salesCount || 0;

    // 库存状态判断
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock < 10;

    // 库存颜色
    const stockColor = isOutOfStock ? '#dc3545' : (isLowStock ? '#ffc107' : '#28a745');
    const stockIcon = isOutOfStock ? 'fas fa-times-circle' : (isLowStock ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle');
    const stockText = isOutOfStock ? '缺货' : (isLowStock ? `仅剩 ${stock} 件` : '库存充足');

    return `
        <div class="product-card ${isRecommended ? 'recommended' : ''}" style="position: relative;">
            ${isRecommended ? '<div class="recommended-badge"><i class="fas fa-star"></i> 推荐</div>' : ''}
            ${isOutOfStock ? '<div class="out-of-stock-overlay"><span>缺货</span></div>' : ''}
            <img src="${product.imageUrl}" alt="${product.name}" class="product-image" style="${isOutOfStock ? 'filter: grayscale(50%);' : ''}">
            <div class="product-info">
                <h3 class="product-title" style="${isOutOfStock ? 'color: #6c757d;' : ''}">${product.name}</h3>
                <p class="product-description" style="${isOutOfStock ? 'color: #adb5bd;' : ''}">${product.description}</p>

                <!-- 供应商信息 -->
                <div class="supplier-info" style="margin: 8px 0; padding: 8px; background: #f0f8ff; border-radius: 4px;">
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <span style="color: #6c757d; font-size: 0.9em;">
                            <i class="fas fa-industry"></i> ${supplierInfo ? supplierInfo.shopName : product.supplier || '官方供应商'}
                        </span>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <span style="color: #ffc107;">${'★'.repeat(Math.floor(rating))}</span>
                            <span style="color: #6c757d; font-size: 0.8em;">(${rating})</span>
                        </div>
                    </div>
                </div>

                <!-- 商品统计 -->
                <div class="product-stats" style="display: flex; justify-content: space-between; margin: 8px 0; font-size: 0.85em;">
                    <span style="color: #28a745;">
                        <i class="fas fa-shopping-cart"></i> 销量: ${salesCount}
                    </span>
                    <span style="color: ${stockColor}; font-weight: ${isLowStock || isOutOfStock ? 'bold' : 'normal'};">
                        <i class="${stockIcon}"></i> 库存: ${stock}
                    </span>
                </div>

                <!-- 商品编号 -->
                <div class="product-code" style="color: #6c757d; font-size: 0.8em; margin: 4px 0;">
                    编号: ${product.productCode || 'N/A'}
                </div>

                <div class="product-footer">
                    <span class="product-price" style="${isOutOfStock ? 'color: #6c757d; text-decoration: line-through;' : ''}">¥${product.price}</span>
                    <button class="add-to-cart-btn"
                            onclick="addToCart('${product._id}')"
                            ${isOutOfStock ? 'disabled style="background: #6c757d; cursor: not-allowed;"' : ''}
                            title="${isOutOfStock ? '商品缺货' : stockText}">
                        ${isOutOfStock ? '缺货' : (isLowStock ? '抢购' : '加入购物车')}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Enhanced search with real-time suggestions
async function realTimeSearch() {
    if (!searchInput) return;
    const query = searchInput.value.trim();

    if (query.length < 2) {
        // 显示推荐商品
        if (recommendedList) {
            displayRecommendedProducts(recommendedProducts);
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
        const products = await response.json();

        // 显示搜索结果在推荐区域
        if (recommendedList) {
            if (products.length > 0) {
                recommendedList.innerHTML = `
                    <div style="grid-column: 1/-1; margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px; text-align: center;">
                        <h3 style="margin: 0 0 8px 0; color: #1976d2;">
                            <i class="fas fa-search"></i> 搜索结果: "${query}"
                        </h3>
                        <p style="margin: 0; color: #666;">找到 ${products.length} 个相关商品</p>
                    </div>
                ` + products.map(product => createProductCard(product, false)).join('');
            } else {
                recommendedList.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                        <i class="fas fa-search" style="font-size: 2em; color: #95a5a6;"></i>
                        <p style="margin-top: 15px; color: #7f8c8d;">未找到与 "${query}" 相关的商品</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

// Enhanced search function
async function searchProducts() {
    if (!searchInput) return;
    const query = searchInput.value.trim();

    if (!query) {
        loadProducts();
        return;
    }

    try {
        const category = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : '';
        let url = `${API_BASE}/products?search=${encodeURIComponent(query)}`;
        if (category) url += `&category=${category}`;

        const response = await fetch(url);
        const products = await response.json();

        // 显示搜索结果在全部商品区域
        displayProducts(products);

        // 显示搜索统计
        if (productList && products.length > 0) {
            const searchStats = document.createElement('div');
            searchStats.style.cssText = 'grid-column: 1/-1; text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;';
            searchStats.innerHTML = `
                <h3 style="margin: 0 0 8px 0; color: #2c3e50;">
                    <i class="fas fa-search"></i> 搜索结果
                </h3>
                <p style="margin: 0; color: #7f8c8d;">找到 ${products.length} 个与 "${query}" 相关的商品</p>
            `;
            productList.insertBefore(searchStats, productList.firstChild);
        }
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

// Sort products
function sortProducts() {
    const sortBy = document.getElementById('sortBy').value;
    console.log(`🔀 用户选择排序: ${sortBy}`);

    // 显示加载状态
    const productList = document.getElementById('productList');
    if (productList) {
        productList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #3498db;"></i>
                <p style="margin-top: 15px; color: #7f8c8d;">正在排序商品...</p>
            </div>
        `;
    }

    // 延迟执行以显示加载状态
    setTimeout(() => {
        loadProducts(sortBy);
    }, 300);
}

// Filter by category
function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    loadProducts(sortBy);
}

// Enhanced add to cart
function addToCart(productId) {
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    const product = allProducts.find(p => p._id === productId) || recommendedProducts.find(p => p._id === productId);
    if (!product) return;

    if (product.stock <= 0) {
        alert('商品库存不足');
        return;
    }

    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        if (existingItem.quantity >= product.stock) {
            alert('已达到库存上限');
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            productId: productId,
            _id: product._id, // 确保包含原始ID
            id: product._id,  // 备用ID字段
            name: product.name,
            price: product.price,
            quantity: 1,
            merchant: product.merchant,
            stock: product.stock
        });
    }

    saveCart();
    updateCartUI();

    // 显示添加成功提示
    showNotification(`✅ ${product.name} 已加入购物车`);
}

// Enhanced checkout with address selection
async function checkout() {
    if (!currentUser) {
        alert('请先登录');
        return;
    }

    if (cart.length === 0) {
        alert('购物车是空的');
        return;
    }

    // 检查库存
    for (const item of cart) {
        if (item.quantity > item.stock) {
            showStockInsufficientModal(item.name, item.stock);
            return;
        }
    }

    try {
        // 获取用户地址
        const addresses = await getUserAddresses();
        let selectedAddress = null;

        if (addresses && addresses.length > 0) {
            // 检查是否有默认地址
            const defaultAddress = addresses.find(addr => addr.isDefault);

            if (defaultAddress) {
                // 如果有默认地址，直接使用
                selectedAddress = defaultAddress;
            } else {
                // 显示地址选择对话框
                selectedAddress = await showAddressSelectionDialog(addresses);
            }
        } else {
            // 提示用户添加地址
            if (confirm('您还没有添加收货地址，是否现在添加？')) {
                selectedAddress = await showAddAddressDialog();
            }
        }

        if (!selectedAddress) {
            return; // 用户取消了操作
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 直接提交订单，跳过支付确认
        const orderData = {
            userId: currentUser.id,
            items: cart.map(item => ({
                productId: item._id || item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            shippingAddress: selectedAddress,
            paymentMethod: '免支付', // 跳过支付
            remarks: document.getElementById('orderRemarks') ? document.getElementById('orderRemarks').value : ''
        };

        const response = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        if (response.ok) {
            const result = await response.json();

            // 显示订单成功信息和详情
            showOrderSuccessModal(result);

            cart = [];
            saveCart();
            updateCartUI();
            toggleCart();
        } else {
            const error = await response.json();
            alert('下单失败: ' + error.message);
        }
    } catch (error) {
        console.error('下单失败:', error);
        alert('下单失败，请重试');
    }
}

// 显示库存不足提示
function showStockInsufficientModal(productName, availableStock) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 30px; border-radius: 10px; max-width: 400px; width: 90%;
        text-align: center;
    `;

    content.innerHTML = `
        <div style="color: #dc3545; font-size: 3em; margin-bottom: 20px;">
            <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2 style="color: #dc3545; margin: 0 0 20px 0;">库存不足</h2>
        <p style="color: #6c757d; margin: 0 0 30px 0;">
            商品 <strong>${productName}</strong> 库存不足<br>
            当前库存：<span style="color: #dc3545; font-weight: bold;">${availableStock}</span> 件
        </p>

        <div style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #721c24;">
                <i class="fas fa-info-circle"></i>
                请减少购买数量或选择其他商品
            </p>
        </div>

        <button onclick="this.closest('.modal').remove()" style="
            background: #dc3545; color: white; border: none; padding: 12px 30px;
            border-radius: 5px; cursor: pointer; font-weight: bold;
        ">
            <i class="fas fa-shopping-cart"></i> 返回购物车
        </button>
    `;

    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 显示订单成功信息
function showOrderSuccessModal(result) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.5); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;
        max-height: 80vh; overflow-y: auto; text-align: center;
    `;

    const order = result.order;
    const logistics = result.logistics;

    content.innerHTML = `
        <div style="color: #28a745; font-size: 3em; margin-bottom: 20px;">
            <i class="fas fa-check-circle"></i>
        </div>
        <h2 style="color: #2c3e50; margin: 0 0 20px 0;">订单提交成功！</h2>
        <p style="color: #6c757d; margin: 0 0 30px 0;">感谢您的购买，订单正在处理中</p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: left; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                <i class="fas fa-receipt"></i> 订单信息
            </h3>
            <div style="margin-bottom: 10px;"><strong>订单号：</strong>${order.orderNumber}</div>
            <div style="margin-bottom: 10px;"><strong>下单时间：</strong>${new Date(order.createdAt).toLocaleString()}</div>
            <div style="margin-bottom: 10px;"><strong>订单状态：</strong><span style="color: #28a745; font-weight: bold;">待发货</span></div>
            <div style="margin-bottom: 10px;"><strong>支付方式：</strong>免支付</div>
            <div style="margin-bottom: 10px;"><strong>订单总额：</strong><span style="color: #e74c3c; font-weight: bold; font-size: 1.1em;">¥${order.total}</span></div>
        </div>

        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: left; margin: 20px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; border-bottom: 2px solid #3498db; padding-bottom: 10px;">
                <i class="fas fa-truck"></i> 物流信息
            </h3>
            <div style="margin-bottom: 10px;"><strong>物流单号：</strong>${logistics.trackingNumber}</div>
            <div style="margin-bottom: 10px;"><strong>物流公司：</strong>${logistics.company}</div>
            <div style="margin-bottom: 10px;"><strong>发货地址：</strong>${logistics.origin.province} ${logistics.origin.city} ${logistics.origin.district}</div>
            <div style="margin-bottom: 10px;"><strong>收货地址：</strong>${logistics.destination.province} ${logistics.destination.city} ${logistics.destination.district} ${logistics.destination.detail}</div>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
                <i class="fas fa-info-circle"></i>
                您的订单已成功提交，我们将尽快为您安排发货。如有疑问请联系客服。
            </p>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 30px;">
            <button onclick="this.closest('.modal').remove(); window.location.href='orders.html'" style="
                background: #3498db; color: white; border: none; padding: 12px 24px;
                border-radius: 5px; cursor: pointer; font-weight: bold;
            ">
                <i class="fas fa-list"></i> 查看我的订单
            </button>
            <button onclick="this.closest('.modal').remove()" style="
                background: #6c757d; color: white; border: none; padding: 12px 24px;
                border-radius: 5px; cursor: pointer;
            ">
                <i class="fas fa-shopping-bag"></i> 继续购物
            </button>
        </div>
    `;

    modal.className = 'modal';
    modal.appendChild(content);
    document.body.appendChild(modal);

    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // 30秒后自动跳转到订单页面
    let countdown = 30;
    const countdownElement = document.createElement('div');
    countdownElement.style.cssText = 'position: absolute; top: 20px; right: 20px; background: #f8f9fa; padding: 10px 15px; border-radius: 5px; font-size: 14px; color: #6c757d;';
    content.appendChild(countdownElement);

    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.innerHTML = `<i class="fas fa-clock"></i> ${countdown}秒后自动跳转到订单页面`;

        if (countdown <= 0) {
            clearInterval(countdownInterval);
            window.location.href = 'orders.html';
        }
    }, 1000);
}

// Get user addresses
async function getUserAddresses() {
    try {
        const response = await fetch(`${API_BASE}/addresses/${currentUser.id}`);
        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('获取地址失败:', error);
    }
    return [];
}

// Show address selection dialog
function showAddressSelectionDialog(addresses) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;
            max-height: 80vh; overflow-y: auto;
        `;

        content.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #2c3e50;">
                <i class="fas fa-map-marker-alt"></i> 选择收货地址
            </h3>
            <div class="address-list">
                ${addresses.map((addr, index) => `
                    <div class="address-option" onclick="selectAddress(${index})" style="
                        border: 2px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 8px; cursor: pointer;
                        ${addr.isDefault ? 'border-color: #3498db; background: #e3f2fd;' : ''}
                    ">
                        ${addr.isDefault ? '<span style="color: #3498db; font-weight: bold;">[默认]</span>' : ''}
                        <div style="font-weight: bold; margin-bottom: 5px;">${addr.name} ${addr.phone}</div>
                        <div style="color: #666;">${addr.province} ${addr.city} ${addr.district} ${addr.detail}</div>
                        <div style="color: #999; font-size: 0.9em; margin-top: 5px;">标签: ${addr.tag || '其他'}</div>
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="cancelAddressSelection()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">
                    取消
                </button>
                <button onclick="addNewAddress()" style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    添加新地址
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        window.selectAddress = (index) => {
            resolve(addresses[index]);
            document.body.removeChild(modal);
            delete window.selectAddress;
            delete window.cancelAddressSelection;
            delete window.addNewAddress;
        };

        window.cancelAddressSelection = () => {
            resolve(null);
            document.body.removeChild(modal);
            delete window.selectAddress;
            delete window.cancelAddressSelection;
            delete window.addNewAddress;
        };

        window.addNewAddress = () => {
            showAddAddressDialog().then(address => {
                if (address) {
                    resolve(address);
                } else {
                    // 重新显示选择对话框
                    document.body.removeChild(modal);
                    showAddressSelectionDialog(addresses).then(resolve);
                }
            });
        };
    });
}

// Show add address dialog
function showAddAddressDialog() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 10px; max-width: 500px; width: 90%;
        `;

        content.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #2c3e50;">
                <i class="fas fa-plus"></i> 添加收货地址
            </h3>
            <form id="addressForm">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">收货人 *</label>
                    <input type="text" name="name" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">手机号 *</label>
                    <input type="tel" name="phone" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">省份 *</label>
                    <input type="text" name="province" required placeholder="如：广东省" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">城市 *</label>
                    <input type="text" name="city" required placeholder="如：深圳市" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">区县 *</label>
                    <input type="text" name="district" required placeholder="如：南山区" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">详细地址 *</label>
                    <textarea name="detail" required placeholder="如：科技园南区A座1201室" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; height: 60px;"></textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: bold;">标签</label>
                    <select name="tag" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="家">家</option>
                        <option value="公司">公司</option>
                        <option value="学校">学校</option>
                        <option value="其他">其他</option>
                    </select>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center;">
                        <input type="checkbox" name="isDefault" style="margin-right: 8px;">
                        设为默认地址
                    </label>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="cancelAddAddress()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 5px; cursor: pointer;">
                        取消
                    </button>
                    <button type="submit" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        保存地址
                    </button>
                </div>
            </form>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        const form = document.getElementById('addressForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const addressData = {
                userId: currentUser.id,
                name: formData.get('name'),
                phone: formData.get('phone'),
                province: formData.get('province'),
                city: formData.get('city'),
                district: formData.get('district'),
                detail: formData.get('detail'),
                tag: formData.get('tag'),
                isDefault: formData.get('isDefault') === 'on'
            };

            try {
                const response = await fetch(`${API_BASE}/addresses`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(addressData)
                });

                if (response.ok) {
                    const savedAddress = await response.json();
                    resolve(savedAddress);
                    document.body.removeChild(modal);
                } else {
                    alert('保存地址失败');
                }
            } catch (error) {
                console.error('保存地址失败:', error);
                alert('保存地址失败，请重试');
            }
        });

        window.cancelAddAddress = () => {
            resolve(null);
            document.body.removeChild(modal);
            delete window.cancelAddAddress;
        };
    });
}

// Show order details
async function showOrderDetails(order) {
    try {
        const response = await fetch(`${API_BASE}/orders/${order._id}`);
        const data = await response.json();

        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: white; padding: 30px; border-radius: 10px; max-width: 600px; width: 90%;
            max-height: 80vh; overflow-y: auto;
        `;

        const logistics = data.logistics;

        content.innerHTML = `
            <h3 style="margin: 0 0 20px 0; color: #2c3e50;">
                <i class="fas fa-file-invoice"></i> 订单详情
            </h3>

            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">订单信息</h4>
                <p style="margin: 5px 0;"><strong>订单号:</strong> ${order.orderNumber}</p>
                <p style="margin: 5px 0;"><strong>状态:</strong> <span style="color: #28a745;">${order.status}</span></p>
                <p style="margin: 5px 0;"><strong>总金额:</strong> ¥${order.total}</p>
                <p style="margin: 5px 0;"><strong>下单时间:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            </div>

            ${logistics ? `
                <div style="margin-bottom: 20px; padding: 15px; background: #e3f2fd; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #1976d2;">
                        <i class="fas fa-truck"></i> 物流信息
                    </h4>
                    <p style="margin: 5px 0;"><strong>快递公司:</strong> ${logistics.carrier}</p>
                    <p style="margin: 5px 0;"><strong>物流单号:</strong> ${logistics.trackingNumber}</p>
                    <p style="margin: 5px 0;"><strong>当前状态:</strong> <span style="color: #28a745;">${logistics.status}</span></p>
                    <p style="margin: 5px 0;"><strong>预计送达:</strong> ${new Date(logistics.estimatedDelivery).toLocaleDateString()}</p>
                </div>
            ` : ''}

            <div style="margin-bottom: 20px;">
                <h4 style="margin: 0 0 10px 0; color: #2c3e50;">商品列表</h4>
                ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                        <div>
                            <div style="font-weight: bold;">${item.name}</div>
                            <div style="color: #666; font-size: 0.9em;">${item.merchant || '官方'}</div>
                        </div>
                        <div style="text-align: right;">
                            <div>¥${item.price} × ${item.quantity}</div>
                            <div style="font-weight: bold;">¥${item.price * item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div style="text-align: center;">
                <button onclick="closeOrderDetails()" style="padding: 10px 30px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    确定
                </button>
            </div>
        `;

        modal.appendChild(content);
        document.body.appendChild(modal);

        window.closeOrderDetails = () => {
            document.body.removeChild(modal);
            delete window.closeOrderDetails;
        };
    } catch (error) {
        console.error('获取订单详情失败:', error);
        alert('获取订单详情失败');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; z-index: 10000;
        background: #28a745; color: white; padding: 15px 20px;
        border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// User menu functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Close user menu when clicking outside
document.addEventListener('click', (e) => {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');

    if (userMenu && !userMenu.contains(e.target) && dropdown) {
        dropdown.style.display = 'none';
    }
});

// Existing functions (kept for compatibility)
function updateUIForUser() {
    if (!currentUser) return;

    // Update user name in navigation
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        userNameElement.textContent = currentUser.name;
    }

    // Update user info in UI
    const userElements = document.querySelectorAll('.user-info');
    userElements.forEach(el => {
        if (el.classList.contains('user-info') && !el.querySelector('.user-name')) {
            el.textContent = currentUser.name;
        }
    });

    // Show admin link if user is admin
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }

    // Show balance if available
    const balanceElement = document.getElementById('userBalance');
    if (balanceElement && currentUser.balance !== undefined) {
        balanceElement.textContent = `¥${currentUser.balance}`;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    currentUser = null;
    window.location.href = '/login.html';
}

// Show my orders
function showMyOrders() {
    window.location.href = '/orders.html';
}

// Show address management
function showAddressManagement() {
    window.location.href = '/address.html';
}

function updateCartUI() {
    updateCartDisplay();
    updateCartCount();
}

function updateCartDisplay() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">购物车是空的</p>';
        if (cartTotalElement) cartTotalElement.textContent = '¥0';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p style="color: #666; font-size: 0.9em;">${item.merchant || '官方'}</p>
                    <p>¥${item.price} × ${item.quantity}</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity('${item.productId}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.productId}', ${item.quantity + 1})">+</button>
                    <button onclick="removeFromCart('${item.productId}')" style="color: red;">删除</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    if (cartTotalElement) cartTotalElement.textContent = `¥${total}`;
}

function updateCartCount() {
    if (!cartCountElement) return;

    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = count;
    cartCountElement.style.display = count > 0 ? 'block' : 'none';
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    const item = cart.find(item =>
        item.productId === productId ||
        item._id === productId ||
        item.id === productId
    );
    if (item && newQuantity <= item.stock) {
        item.quantity = newQuantity;
        saveCart();
        updateCartUI();
    } else if (item && newQuantity > item.stock) {
        alert('已达到库存上限');
    }
}

function removeFromCart(productId) {
    console.log('尝试删除商品 ID:', productId);
    console.log('删除前购物车:', cart);

    // 更强大的删除逻辑，处理多种可能的ID情况
    const originalLength = cart.length;
    cart = cart.filter(item => {
        // 检查所有可能的ID字段
        return item.productId !== productId &&
               item._id !== productId &&
               item.id !== productId;
    });

    console.log('删除后购物车:', cart);
    console.log('删除了', originalLength - cart.length, '个商品');

    saveCart();
    updateCartUI();

    // 显示删除成功提示
    if (originalLength > cart.length) {
        showNotification('🗑️ 商品已从购物车移除');
    } else {
        showNotification('❌ 未能从购物车中删除商品');
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    if (sidebar) {
        sidebar.classList.toggle('open');
    }
}


// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .product-card.recommended {
        border: 2px solid #ff6b6b;
        box-shadow: 0 4px 15px rgba(255, 107, 107, 0.2);
    }

    .recommended-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff6b6b;
        color: white;
        padding: 5px 10px;
        border-radius: 15px;
        font-size: 0.8em;
        font-weight: bold;
        z-index: 10;
    }

    .address-option:hover {
        border-color: #3498db !important;
        background: #f8f9fa !important;
    }

    .merchant-info {
        transition: all 0.3s ease;
    }

    .product-stats {
        font-family: Arial, sans-serif;
    }

    .product-code {
        font-family: monospace;
        background: #f1f3f4;
        padding: 2px 6px;
        border-radius: 3px;
        display: inline-block;
    }
`;
document.head.appendChild(style);