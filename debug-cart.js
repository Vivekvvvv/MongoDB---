// 在浏览器控制台中运行这个脚本来检查购物车
console.log('=== 购物车调试信息 ===');
console.log('当前购物车内容:', JSON.parse(localStorage.getItem('cart') || '[]'));

console.log('\n=== 删除函数测试 ===');
// 测试删除函数
const testRemove = (productId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log(`尝试删除 productId: ${productId}`);
    console.log('删除前购物车项目数量:', cart.length);

    const filteredCart = cart.filter(item => item.productId !== productId);
    console.log('删除后购物车项目数量:', filteredCart.length);

    return filteredCart;
};

// 测试机械键盘的productId（如果存在的话）
const cart = JSON.parse(localStorage.getItem('cart') || '[]');
const keyboardItem = cart.find(item => item.name && item.name.includes('键盘'));

if (keyboardItem) {
    console.log('找到键盘商品:', keyboardItem);
    console.log('键盘的productId:', keyboardItem.productId);
    console.log('键盘的_id:', keyboardItem._id);

    // 测试删除
    const result = testRemove(keyboardItem.productId);
    console.log('测试删除结果:', result);
} else {
    console.log('购物车中没有找到键盘商品');
}

console.log('\n=== 所有购物车项目ID信息 ===');
cart.forEach((item, index) => {
    console.log(`项目 ${index + 1}: ${item.name}`);
    console.log(`  - productId: ${item.productId}`);
    console.log(`  - _id: ${item._id}`);
    console.log('---');
});