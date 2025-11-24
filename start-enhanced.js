#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动增强版电商平台...\n');

// 第一步：更新商品库存
console.log('📦 正在更新商品库存...');
const stockUpdate = spawn('node', ['update-stock.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

stockUpdate.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ 库存更新完成');
    console.log('\n🌐 启动增强版服务器...\n');

    // 第二步：启动增强版服务器
    const server = spawn('node', ['server-enhanced.js'], {
      stdio: 'inherit',
      cwd: __dirname
    });

    server.on('close', (code) => {
      console.log(`服务器进程退出，代码: ${code}`);
    });

    // 处理进程终止信号
    process.on('SIGINT', () => {
      console.log('\n🛑 正在关闭服务器...');
      server.kill('SIGINT');
    });

  } else {
    console.error('❌ 库存更新失败，请检查错误信息');
    process.exit(1);
  }
});

stockUpdate.on('error', (error) => {
  console.error('❌ 启动库存更新失败:', error);
  process.exit(1);
});