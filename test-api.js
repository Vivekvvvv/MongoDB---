const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';

async function testProductAPI() {
    console.log('🧪 测试商品API功能...\n');

    try {
        // 测试获取所有商品
        console.log('1. 测试获取所有商品...');
        const allProducts = await fetch(`${API_BASE}/products`);
        const productsData = await allProducts.json();
        console.log(`✅ 获取到 ${productsData.length} 个商品`);

        if (productsData.length > 0) {
            console.log(`   示例商品: ${productsData[0].name}, 价格: ¥${productsData[0].price}, 库存: ${productsData[0].stock}`);
        }

        // 测试价格排序 - 从低到高
        console.log('\n2. 测试价格排序（从低到高）...');
        const priceAscResponse = await fetch(`${API_BASE}/products?sortBy=priceAsc`);
        const priceAscData = await priceAscResponse.json();

        if (priceAscData.length > 1) {
            const isSortedAsc = priceAscData.every((product, index) => {
                if (index === 0) return true;
                return product.price >= priceAscData[index - 1].price;
            });

            if (isSortedAsc) {
                console.log('✅ 价格从低到高排序正常');
                console.log(`   最低价: ¥${priceAscData[0].price} (${priceAscData[0].name})`);
                console.log(`   最高价: ¥${priceAscData[priceAscData.length - 1].price} (${priceAscData[priceAscData.length - 1].name})`);
            } else {
                console.log('❌ 价格从低到高排序异常');
            }
        }

        // 测试价格排序 - 从高到低
        console.log('\n3. 测试价格排序（从高到低）...');
        const priceDescResponse = await fetch(`${API_BASE}/products?sortBy=priceDesc`);
        const priceDescData = await priceDescResponse.json();

        if (priceDescData.length > 1) {
            const isSortedDesc = priceDescData.every((product, index) => {
                if (index === 0) return true;
                return product.price <= priceDescData[index - 1].price;
            });

            if (isSortedDesc) {
                console.log('✅ 价格从高到低排序正常');
                console.log(`   最高价: ¥${priceDescData[0].price} (${priceDescData[0].name})`);
                console.log(`   最低价: ¥${priceDescData[priceDescData.length - 1].price} (${priceDescData[priceDescData.length - 1].name})`);
            } else {
                console.log('❌ 价格从高到低排序异常');
            }
        }

        // 测试销量排序
        console.log('\n4. 测试销量排序...');
        const salesResponse = await fetch(`${API_BASE}/products?sortBy=salesCount`);
        const salesData = await salesResponse.json();

        if (salesData.length > 1) {
            const isSortedBySales = salesData.every((product, index) => {
                if (index === 0) return true;
                return (product.salesCount || 0) >= (salesData[index - 1].salesCount || 0);
            });

            if (isSortedBySales) {
                console.log('✅ 销量排序正常');
                console.log(`   销量最高: ${salesData[0].salesCount || 0} (${salesData[0].name})`);
            } else {
                console.log('❌ 销量排序异常');
            }
        }

        // 测试库存排序
        console.log('\n5. 测试库存排序...');
        const stockResponse = await fetch(`${API_BASE}/products?sortBy=stock`);
        const stockData = await stockResponse.json();

        if (stockData.length > 1) {
            const isSortedByStock = stockData.every((product, index) => {
                if (index === 0) return true;
                return (product.stock || 0) >= (stockData[index - 1].stock || 0);
            });

            if (isSortedByStock) {
                console.log('✅ 库存排序正常');
                console.log(`   库存最多: ${stockData[0].stock || 0} (${stockData[0].name})`);
            } else {
                console.log('❌ 库存排序异常');
            }
        }

        // 检查是否有缺货商品
        console.log('\n6. 检查商品库存状态...');
        const outOfStock = productsData.filter(p => !p.stock || p.stock <= 0);
        if (outOfStock.length === 0) {
            console.log('✅ 所有商品都有库存');
        } else {
            console.log(`⚠️  有 ${outOfStock.length} 个商品缺货:`);
            outOfStock.forEach(p => {
                console.log(`   - ${p.name}: 库存 ${p.stock || 0}`);
            });
        }

        // 测试推荐商品API
        console.log('\n7. 测试推荐商品API...');
        const recommendedResponse = await fetch(`${API_BASE}/products/recommended`);
        const recommendedData = await recommendedResponse.json();
        console.log(`✅ 获取到 ${recommendedData.length} 个推荐商品`);

        console.log('\n🎉 API测试完成！');

    } catch (error) {
        console.error('❌ API测试失败:', error.message);
        console.log('\n请确保增强版服务器正在运行：');
        console.log('npm run start-enhanced');
    }
}

// 运行测试
testProductAPI();