const productList = document.getElementById('productList');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalElement = document.getElementById('cartTotal');
const cartCountElement = document.getElementById('cartCount');
const searchInput = document.getElementById('searchInput');

let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let allProducts = []; 
let currentUser = null;

// Check login status on load
document.addEventListener('DOMContentLoaded', () => {
    // Skip logic if we are on specific pages that handle their own init or don't need auth immediately (like login)
    if (window.location.pathname.includes('login.html')) return;

    const userStr = localStorage.getItem('user');
    if (!userStr) {
        window.location.href = '/login.html';
        return;
    }
    currentUser = JSON.parse(userStr);
    
    updateUIForUser();
    
    // Only fetch products if we are on the main page
    if (document.getElementById('productList')) {
        fetchProducts();
    }
    
    updateCartUI();
});

// Search functionality
if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') searchProducts();
    });
}

function searchProducts() {
    if (!searchInput) return;
    const query = searchInput.value.toLowerCase();
    const category = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : '';
    
    const filtered = allProducts.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query);
        const matchesCategory = category === '' || p.category === category;
        return matchesSearch && matchesCategory;
    });
    displayProducts(filtered);
}

function filterByCategory() {
    searchProducts();
}

// Fetch products from API
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        displayProducts(allProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        productList.innerHTML = '<p style="color: red;">加载商品失败</p>';
    }
}

// Display products in the grid
function displayProducts(products) {
    if (products.length === 0) {
        productList.innerHTML = '<p>暂无商品，请在上方添加。</p>';
        return;
    }

    productList.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.onclick = (e) => {
            // Don't redirect if clicking the add button
            if (!e.target.closest('.add-btn')) {
                window.location.href = `/product.html?id=${product._id}`;
            }
        };
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <img src="${escapeHtml(product.imageUrl)}" alt="${escapeHtml(product.name)}" class="product-img">
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-desc">${escapeHtml(product.description)}</p>
                <div class="product-footer">
                    <span class="product-price">¥${product.price.toFixed(2)}</span>
                    <button class="add-btn" onclick="addToCart('${product._id}', '${escapeHtml(product.name)}', ${product.price})">
                        <i class="fas fa-cart-plus"></i> 加入购物车
                    </button>
                </div>
            </div>
        `;
        productList.appendChild(div);
    });
}

// Cart Functions
function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    saveCart();
    updateCartUI();
    toggleCart(true); // Open cart when adding
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartUI() {
    // Update count
    if (!cartCountElement) return;

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.textContent = totalCount;

    // Update list
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">购物车是空的</p>';
        cartTotalElement.textContent = '0.00';
        return;
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div>¥${item.price.toFixed(2)} x ${item.quantity}</div>
            </div>
            <div class="cart-item-actions">
                <div class="cart-item-price">¥${itemTotal.toFixed(2)}</div>
                <button class="remove-item" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(div);
    });

    cartTotalElement.textContent = total.toFixed(2);
}

function toggleCart(forceOpen = false) {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('overlay');
    
    if (forceOpen) {
        sidebar.classList.add('open');
        overlay.classList.add('open');
    } else {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    }
}

async function checkout() {
    if (cart.length === 0) return;

    if (!confirm('确定要结算吗？总计: ¥' + cartTotalElement.textContent)) return;

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                items: cart,
                total: parseFloat(cartTotalElement.textContent)
            })
        });

        if (response.ok) {
            alert('订单支付成功！感谢您的购买。');
            cart = [];
            saveCart();
            updateCartUI();
            toggleCart(false);
            toggleOrders(); // Show orders after checkout
        } else {
            alert('订单处理失败');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('网络错误');
    }
}

// Handle Admin Product Form (for admin.html)
const adminForm = document.getElementById('adminProductForm');
if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('prodName').value;
        const price = parseFloat(document.getElementById('prodPrice').value);
        const description = document.getElementById('prodDesc').value;
        const imageUrl = document.getElementById('prodImage').value || 'https://via.placeholder.com/200';
        const category = document.getElementById('prodCategory').value;

        const productData = { name, price, description, imageUrl, category };

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (response.ok) {
                alert('商品上架成功！');
                window.location.href = '/';
            } else {
                const error = await response.json();
                alert('Error: ' + error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to server');
        }
    });
}

function updateUIForUser() {
    // Show user name or logout button
    const navActions = document.querySelector('.nav-actions');
    if (!navActions) return;
    
    // Add Logout Button if not exists
    if (!document.getElementById('logoutBtn')) {
        const logoutDiv = document.createElement('div');
        logoutDiv.className = 'nav-item';
        logoutDiv.id = 'logoutBtn';
        logoutDiv.innerHTML = `<i class="fas fa-sign-out-alt"></i> 退出 (${currentUser.name})`;
        logoutDiv.onclick = logout;
        navActions.insertBefore(logoutDiv, navActions.firstChild);
    }

    // Add Profile Button if not exists
    if (!document.getElementById('profileBtn')) {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'nav-item';
        profileDiv.id = 'profileBtn';
        profileDiv.innerHTML = `<i class="fas fa-user"></i> 个人中心`;
        profileDiv.onclick = () => window.location.href = '/profile.html';
        navActions.insertBefore(profileDiv, navActions.firstChild);
    }

    // Hide/Show Admin Button based on role
    const adminBtn = document.getElementById('adminLink');
    if (currentUser.role === 'admin') {
        if (!adminBtn) {
            const btn = document.createElement('div');
            btn.className = 'nav-item';
            btn.id = 'adminLink';
            btn.innerHTML = '<i class="fas fa-user-cog"></i> 管理后台';
            btn.onclick = () => window.location.href = '/admin.html';
            // Insert before cart
            const cartBtn = document.querySelector('.nav-cart');
            if (cartBtn) navActions.insertBefore(btn, cartBtn);
        }
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

function toggleOrders() {
    const modal = document.getElementById('ordersModal');
    const overlay = document.getElementById('overlay');
    
    if (!modal || !overlay) return;

    if (modal.classList.contains('open')) {
        modal.classList.remove('open');
        overlay.classList.remove('open');
    } else {
        modal.classList.add('open');
        overlay.classList.add('open');
        fetchOrders();
    }
}

async function fetchOrders() {
    const list = document.getElementById('ordersList');
    if (!list) return;
    list.innerHTML = '<p>加载中...</p>';
    
    try {
        const response = await fetch('/api/orders');
        const orders = await response.json();
        
        if (orders.length === 0) {
            list.innerHTML = '<p>暂无订单记录</p>';
            return;
        }

        list.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <span>订单号: ${order._id.slice(-6)}</span>
                    <span>${new Date(order.createdAt).toLocaleString()}</span>
                    <span class="order-status">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item-row">
                            <span>${escapeHtml(item.name)} x${item.quantity}</span>
                            <span>¥${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    实付: ¥${order.total.toFixed(2)}
                </div>
            </div>
        `).join('');
    } catch (error) {
        list.innerHTML = '<p style="color: red">加载失败</p>';
    }
}

// Helper to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
