#!/bin/bash

# Flashswap 套利合约演示脚本
# 完整展示合约的所有功能

echo ""
echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║           Flashswap 套利合约 - 完整演示脚本                           ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# 进入项目目录
cd /home/sshawn/Project/uniswap-arbitrage-flash-swap

echo "1️⃣  运行自动化测试脚本..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

truffle exec execute.js --network testnet

echo ""
echo "2️⃣  现在可以进入Truffle Console进行交互式操作"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "运行以下命令进入交互式Console："
echo ""
echo "  $ truffle console --network testnet"
echo ""
echo "在Console中可以执行："
echo ""
echo "  > const fs = await Flashswap.deployed()"
echo "  > const owner = await fs.owner()"
echo "  > console.log('Owner:', owner)"
echo ""
echo "测试check()函数："
echo ""
echo "  > const [p,a] = await fs.check("
echo "      '0xae13d989dac2f0debff460ac112a837c89baa7cd',"
echo "      web3.utils.toWei('0.01', 'ether'),"
echo "      '0xae13d989dac2f0debff460ac112a837c89baa7cd',"
echo "      '0xd99d0564b02c0b83e6c5e9c47bd9f0efcde9b85e',"
echo "      '0xd9e1ce17f2641f24ae4719f23d848bab4c75c2e6'"
echo "    )"
echo "  > console.log('Profit:', web3.utils.fromWei(p, 'ether'))"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 演示脚本执行完成"
echo ""
