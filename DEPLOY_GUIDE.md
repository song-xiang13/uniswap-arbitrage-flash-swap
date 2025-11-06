# BSC 测试网部署指南

## 📋 前置条件

### 1. 安装依赖
```bash
npm install
```

### 2. 准备钱包
- 使用测试钱包（生成新的私钥，不要使用生产钱包）
- 获取测试BNB币

**获取测试币方式：**
- https://testnet.binance.org/faucet-smart
- https://faucets.chain.link/binance-testnet

### 3. 配置 `.env` 文件

编辑 `.env` 文件，设置您的私钥：

```bash
# 您的钱包私钥（不包含0x前缀）
PRIVATE_KEY=您的私钥(64个十六进制字符)

# WebSocket连接（可选）
WSS_BLOCKS=wss://bsc-ws-node.nariox.org:443

# 部署后将合约地址填写到这里
CONTRACT=0x00000
```

⚠️ **安全提示：**
- 不要使用mainnet的私钥
- 不要将 `.env` 文件上传到Git
- 确保 `.gitignore` 包含 `.env`

---

## 🚀 部署步骤

### 第一步：编译合约

```bash
truffle compile
```

预期输出：
```
Compiling your contracts...
===========================
> Compiling ./contracts/Flashswap.sol
> Compiling ./contracts/Migrations.sol
> Artifacts written to /path/to/build/contracts
> Compiled successfully
```

### 第二步：部署到BSC测试网

```bash
truffle migrate --network testnet
```

### 可选：执行dry-run测试

```bash
truffle migrate --network testnet --dry-run
```

### 可选：重置部署（重新部署所有合约）

```bash
truffle migrate --network testnet --reset
```

---

## ✅ 部署成功标志

部署完成后，您会看到：

```
Starting migrations...
======================
> Network name:    'testnet'
> Network id:      97
> Block gas limit: 30000000 (0x1c9c380)


1_initial_migration.js
======================

   Deploying 'Migrations'
   ----------------------
   > transaction hash:    0x...
   > Blocks: 2        Seconds: 10
   > contract address:    0x... (Migrations合约地址)
   > block number:        xxxxx
   > block timestamp:     1234567890
   > account:             0x... (您的钱包地址)
   > balance:             9.999 BNB
   > gas used:            148000 (0x24110)
   > gas price:           10 gwei
   > value sent:          0 ETH
   > total cost:          0.00148 ETH

   > Saving migration to chain.
   > Saving artifacts
   ✓ Migrations deployed successfully!

2_deploy_flashswap.js
======================

   Deploying 'Flashswap'
   ----------------------
   > transaction hash:    0x...
   > Blocks: 2        Seconds: 10
   > contract address:    0x... (Flashswap合约地址)
   > block number:        xxxxx
   > block timestamp:     1234567890
   > account:             0x... (您的钱包地址)
   > balance:             9.998 BNB
   > gas used:            456000 (0x6f2f0)
   > gas price:           10 gwei
   > value sent:          0 ETH
   > total cost:          0.00456 ETH

   > Saving migration to chain.
   > Saving artifacts

   ✓ Flashswap deployed successfully!
   ✓ Contract address: 0x...
   ✓ Owner: 0x...

   Next steps:
   1. Update .env file with CONTRACT=0x...
   2. Verify contract on block explorer
   3. Test the start() function with your arbitrage parameters
```

---

## 📍 部署后步骤

### 1. 更新 `.env` 文件

```bash
CONTRACT=0x部署成功的合约地址
```

### 2. 在区块浏览器验证合约

访问：https://testnet.bscscan.com/

搜索您的合约地址，验证合约代码

### 3. 验证合约所有权

```bash
truffle console --network testnet
```

```javascript
const flashswap = await Flashswap.deployed();
const owner = await flashswap.owner();
console.log("Owner:", owner);
```

---

## 📡 BSC 测试网配置

| 参数 | 值 |
|------|-----|
| **网络名称** | BSC Testnet |
| **Chain ID** | 97 |
| **RPC** | https://data-seed-prebsc-1-s0.binance.org:8545/ |
| **区块浏览器** | https://testnet.bscscan.com/ |
| **Gas Price** | ~10 Gwei |
| **出块时间** | ~3秒 |

### 备用RPC节点

如果官方RPC不稳定，可以尝试：

```javascript
// 配置文件中修改 testnet provider
'https://bsc-testnet-rpc.publicnode.com'
'https://bsc-testnet.public.blastapi.io'
```

---

## 🛠️ 故障排查

### 错误：Cannot find module '../binaries/uws_linux_x64_127.node'

这是Truffle和ganache的兼容性问题，**不影响远程部署**。可以忽略此警告。

### 错误：Could not create addresses from your mnemonic or private key(s)

**原因：** PRIVATE_KEY格式不正确

**解决方案：**
1. 确保私钥是64个十六进制字符（不包含0x）
2. 私钥应该是有效的以太坊私钥

### 错误：Network request failed / ETIMEDOUT

**原因：** RPC节点不可达

**解决方案：**
1. 检查网络连接
2. 尝试其他RPC节点
3. 检查防火墙设置

### 错误：Not enough balance / insufficient funds

**原因：** 账户没有足够的BNB测试币

**解决方案：**
1. 去[BSC Faucet](https://testnet.binance.org/faucet-smart)获取测试币
2. 等待到账（通常几秒钟）

### 错误：Contract creation failed / out of gas

**原因：** Gas限额设置过低

**解决方案：** 在 `truffle-config.js` 中调整 gas 参数：

```javascript
testnet: {
  provider: () => new HDWalletProvider(...),
  network_id: 97,
  gas: 6000000,        // 增加Gas限额
  gasPrice: 10000000000
}
```

---

## 📝 迁移脚本说明

### 1_initial_migration.js
- 部署Migrations合约
- Truffle框架要求
- 用于追踪部署历史

### 2_deploy_flashswap.js
- 部署主要的Flashswap套利合约
- 设置部署者为合约所有者
- 包含详细的部署日志

---

## 🔐 安全建议

1. **不要在代码中硬编码私钥**
   - 始终使用 `.env` 文件
   - 确保 `.gitignore` 包含 `.env`

2. **使用专用的测试钱包**
   - 不要使用生产钱包的私钥
   - 测试后可以丢弃该钱包

3. **验证合约代码**
   - 在区块浏览器上验证源代码
   - 确保部署的代码与本地代码一致

4. **测试充分再上mainnet**
   - 在testnet上充分测试所有功能
   - 验证套利逻辑的正确性
   - 检查Gas消耗

---

## 📚 有用资源

- [Truffle文档](https://trufflesuite.com/docs/truffle/overview)
- [BSC文档](https://docs.binance.org/)
- [BSC Testnet Faucet](https://testnet.binance.org/faucet-smart)
- [BSC Testnet浏览器](https://testnet.bscscan.com/)
- [OpenZeppelin合约](https://docs.openzeppelin.com/contracts/)

---

## 💡 下一步

部署成功后，您可以：

1. **测试start()函数**
   - 使用truffle console进行测试调用
   - 验证套利逻辑

2. **集成到您的机器人**
   - 将合约地址写入配置
   - 连接到websocket监听事件
   - 实现自动套利机制

3. **部署到Mainnet**
   - 在testnet充分测试后
   - 部署到BSC Mainnet (Chain ID: 56)
   - 使用真实资金进行套利

---

祝您部署顺利！🎉
