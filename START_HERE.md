# 🚀 开始使用 Flashswap 套利合约

## ✅ 已完成的准备工作

您已成功完成以下所有工作：

- ✅ 合约部署到 BSC 测试网
- ✅ 合约功能验证完毕
- ✅ 配置文件已更新
- ✅ 测试脚本已准备
- ✅ 文档已生成

**合约已准备就绪，可以使用！**

---

## 📍 合约地址和信息

```
合约地址:  0x4079167FD24C10d4795a7Bc6c714DAAe5f04e138
所有者:    0x3FEA7CfF8d3dc87FD8B5b5EeF3C4A9ab9F844091
网络:      BSC Testnet (Chain ID: 97)
余额:      1.13585401 BNB
```

**区块浏览器链接：**
https://testnet.bscscan.com/address/0x4079167FD24C10d4795a7Bc6c714DAAe5f04e138

---

## 🎯 现在可以做什么（5分钟快速开始）

### 方式1：使用Truffle Console（推荐，最简单）

```bash
# 进入交互式console
truffle console --network testnet
```

然后在console中运行以下命令验证合约：

```javascript
// 1. 获取合约实例
const flashswap = await Flashswap.deployed()

// 2. 验证所有者
const owner = await flashswap.owner()
console.log("Owner:", owner)

// 3. 获取账户信息
const accounts = await web3.eth.getAccounts()
const balance = await web3.eth.getBalance(accounts[0])
console.log("Your balance:", web3.utils.fromWei(balance, 'ether'), "BNB")

// 4. 获取当前区块
const blockNumber = await web3.eth.getBlockNumber()
console.log("Current block:", blockNumber)
```

✅ 如果一切正常，您应该看到账户信息和BNB余额。

---

### 方式2：运行自动化测试脚本

```bash
# 运行自动化套利测试
truffle exec run_arbitrage.js --network testnet

# 或运行交互式工具（推荐）
truffle exec interactive_test.js --network testnet
```

这会自动：
- 验证合约信息
- 尝试多个交易对
- 计算预期利润
- 如果找到机会，执行套利

---

## 🧪 测试check()函数（计算利润）

### 快速测试示例

进入Truffle console后：

```javascript
const flashswap = await Flashswap.deployed()

// 准备参数
const tokenBorrow = "0xae13d989dac2f0debff460ac112a837c89baa7cd"  // WBNB
const amountTokenPay = web3.utils.toWei("0.1", "ether")  // 0.1 BNB
const tokenPay = "0xae13d989dac2f0debff460ac112a837c89baa7cd"    // WBNB
const sourceRouter = "0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E" // PancakeSwap
const targetRouter = "0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6" // SushiSwap

// 计算利润
const [profit, amount] = await flashswap.check(
  tokenBorrow,
  amountTokenPay,
  tokenPay,
  sourceRouter,
  targetRouter
)

// 显示结果
console.log("Profit:", web3.utils.fromWei(profit, 'ether'), "BNB")
console.log("Borrow amount:", web3.utils.fromWei(amount, 'ether'))
```

**预期结果：**
- 如果 `profit > 0`：✅ 有套利机会！
- 如果 `profit <= 0`：❌ 暂无利可图

---

## 💰 执行套利交易 (仅当profit > 0)

只有在 `check()` 函数返回 `profit > 0` 时才执行以下操作：

```javascript
const flashswap = await Flashswap.deployed()
const accounts = await web3.eth.getAccounts()
const deployer = accounts[0]

// 获取当前区块和余额
const blockNumber = await web3.eth.getBlockNumber()
const balanceBefore = await web3.eth.getBalance(deployer)

console.log("Before: ", web3.utils.fromWei(balanceBefore, 'ether'), "BNB")

// 执行套利
const maxBlockNumber = blockNumber + 100

const tx = await flashswap.start(
  maxBlockNumber,
  "0xae13d989dac2f0debff460ac112a837c89baa7cd",  // tokenBorrow
  web3.utils.toWei("0.1", "ether"),                // amountTokenPay
  "0xae13d989dac2f0debff460ac112a837c89baa7cd",  // tokenPay
  "0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E",  // sourceRouter
  "0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6",  // targetRouter
  "0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC"   // sourceFactory
)

console.log("Tx hash:", tx.tx)
console.log("Gas used:", tx.receipt.gasUsed)

// 等待1-2秒，然后检查新余额
setTimeout(async () => {
  const balanceAfter = await web3.eth.getBalance(deployer)
  const profit = balanceAfter - balanceBefore
  console.log("After:  ", web3.utils.fromWei(balanceAfter, 'ether'), "BNB")
  console.log("Profit: ", web3.utils.fromWei(profit, 'ether'), "BNB")
}, 2000)
```

---

## 📌 重要参数说明

### check() 函数参数

```
tokenBorrow:   借入的代币地址 (e.g., WBNB)
amountTokenPay: 支付的代币数量 (wei单位)
tokenPay:      支付代币地址 (e.g., WBNB)
sourceRouter:  源DEX的Router地址 (e.g., PancakeSwap)
targetRouter:  目标DEX的Router地址 (e.g., SushiSwap)
```

### start() 函数参数

```
maxBlockNumber:  最大执行块号 (当前块 + 100)
tokenBorrow:    同上
amountTokenPay: 同上
tokenPay:       同上
sourceRouter:   同上
targetRouter:   同上
sourceFactory:  源DEX的Factory地址
```

---

## 🔗 已知的BSC测试网配置

### 代币地址

| 代币 | 地址 |
|------|------|
| WBNB | 0xae13d989dac2f0debff460ac112a837c89baa7cd |
| USDT | 0x337610d27c682e347c9cd60bd4b3b107c9d34ddd |
| ETH  | 0x8babbb98678facc7342735bbb9737fc2d7c3ddd1 |
| BUSD | 0x78867BbEeF67c351045A0dd3a16838E9c72F4d78 |

### DEX信息

| DEX | Router | Factory |
|-----|--------|---------|
| PancakeSwap | 0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E | 0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC |
| SushiSwap | 0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6 | 0xc35DADB65012eC5796536bD9864eD8773aBc74C4 |

---

## ⚠️ 常见问题和解决方案

### Q1: check()返回 "execution reverted"

**原因：** 交易对不存在或DEX地址错误

**解决：**
1. 检查代币地址是否正确（小写）
2. 访问 https://testnet.pancakeswap.finance 检查交易对是否存在
3. 确认DEX路由地址是否正确
4. 尝试不同的交易对组合

### Q2: profit 为负数

**原因：** 交换费用和闪电贷费用高于交换利润

**解决：**
1. 寻找价差更大的交易对
2. 增加交易金额（但要小心gas成本）
3. 尝试不同的DEX组合
4. 等待更好的市场条件

### Q3: 交易执行失败

**可能原因：**
- Gas不足
- 滑点太大
- 块号超时（maxBlockNumber过期）
- 流动性不足

**解决：**
- 增加maxBlockNumber值
- 检查Gas余额
- 减小交易金额
- 设置合理的slippage

### Q4: 利润很低

**原因：** 需要考虑以下成本
- 闪电贷费用: 0.25%
- DEX交换费: 0.25% - 0.3%
- Gas成本: ~0.01 BNB
- **总成本: > 0.8%**

**需要找到:** 价差 > 0.8% 的交易对

---

## 📚 更多文档

如果您需要更多帮助，请查看以下文档：

| 文档 | 内容 |
|------|------|
| **NEXT_STEPS.md** | 完整的下一步指南 |
| **ARBITRAGE_TEST.md** | 详细的套利测试指南 |
| **POST_DEPLOYMENT.md** | 部署后操作清单 |
| **DEPLOY_GUIDE.md** | 详细的部署指南 |
| **QUICK_START.md** | 快速命令参考 |

---

## 🎯 推荐的学习路径

### 第一步：学习基础（15分钟）
1. 阅读本文档
2. 进入Truffle console
3. 验证合约信息
4. 运行简单的check()测试

### 第二步：实战演练（30分钟）
1. 寻找有流动性的交易对
2. 运行check()计算利润
3. 如果profit > 0，执行start()
4. 记录结果和经验

### 第三步：优化和扩展（可选）
1. 建立自动监听系统
2. 支持更多交易对
3. 优化Gas使用
4. 部署到主网（谨慎！）

---

## 🚀 快速命令汇总

```bash
# 进入交互式console
truffle console --network testnet

# 自动化套利测试
truffle exec run_arbitrage.js --network testnet

# 交互式测试工具
truffle exec interactive_test.js --network testnet

# 编译合约
truffle compile

# 重新部署
truffle migrate --network testnet --reset
```

---

## 💡 最后的建议

1. **不要急**
   - 测试网的交易对可能不多
   - 找到有套利机会的对可能需要时间
   - 不要跳过profit检查

2. **小额开始**
   - 第一笔交易用小额
   - 验证逻辑正确后再增加金额

3. **监控成本**
   - Gas费用很高时不要交易
   - 记录每笔交易的成本
   - 确保利润 > 总成本

4. **学习和改进**
   - 保存每次测试的结果
   - 分析成功和失败的原因
   - 不断优化交易参数

5. **谨慎上线**
   - 在testnet充分测试后再考虑mainnet
   - mainnet真实资金风险很大
   - 始终验证代码和参数

---

## 🎊 现在就开始吧！

```bash
# 1. 进入Truffle console
truffle console --network testnet

# 2. 验证合约
const flashswap = await Flashswap.deployed()
const owner = await flashswap.owner()
console.log("Owner:", owner)

# 3. 测试check()函数
const accounts = await web3.eth.getAccounts()
const [profit, amount] = await flashswap.check(...)

# 4. 显示利润
console.log("Profit:", web3.utils.fromWei(profit, 'ether'), "BNB")

# 5. 如果profit > 0，执行start()
# await flashswap.start(...)
```

---

祝您使用愉快！有任何问题，查看文档或重新运行 `interactive_test.js`。🚀💰
