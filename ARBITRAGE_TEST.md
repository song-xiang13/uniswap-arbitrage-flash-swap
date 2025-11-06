# Flashswap 套利合约测试指南

## 📋 当前状态

✅ **合约已部署到 BSC 测试网**

| 项目 | 值 |
|------|-----|
| **合约地址** | `0x4079167FD24C10d4795a7Bc6c714DAAe5f04e138` |
| **所有者** | `0x3FEA7CfF8d3dc87FD8B5b5EeF3C4A9ab9F844091` |
| **网络** | BSC Testnet (Chain ID: 97) |
| **区块浏览器** | https://testnet.bscscan.com |

---

## 🎯 合约功能说明

### 1. `start()` 函数 - 启动套利

**参数：**
```solidity
function start(
    uint _maxBlockNumber,        // 最大执行区块数
    address _tokenBorrow,        // 借入的代币（例：BUSD）
    uint256 _amountTokenPay,     // 支付的代币数量（例：10 * 1e18 BNB）
    address _tokenPay,           // 支付代币地址（例：BNB）
    address _sourceRouter,       // 源交易所路由（例：PancakeSwap）
    address _targetRouter,       // 目标交易所路由（例：SushiSwap）
    address _sourceFactory       // 源交易所工厂合约
)
```

**逻辑流程：**
1. 验证区块号不超过限制
2. 检查预期利润是否大于0
3. 从源交易所借取代币（闪电贷）
4. 触发 `pancakeCall()` 回调
5. 在目标交易所交换代币
6. 还款并获取利润

### 2. `check()` 函数 - 计算预期利润

**参数：** 同 `start()` 函数的部分参数

**返回值：**
- `profit`: 预期利润（如果为负数则无利可图）
- `tokenBorrowAmount`: 实际借入的代币数量

---

## 🔗 BSC 测试网关键信息

### 常用代币地址（测试网）

| 代币 | 地址 | 小数位 |
|------|------|--------|
| **BNB** | 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c | 18 |
| **BUSD** | 0x78867BbEeF67c351045A0dd3a16838E9c72F4d78 | 18 |
| **USDT** | 0x7ef95a0fee0dd31b22626649937b0a1418aaeba1 | 6 |
| **WBNB** | 0xae13d989dac2f0debff460ac112a837c89baa7cd | 18 |

### 主要交易所路由地址（测试网）

| 交易所 | 路由地址 | 工厂地址 |
|--------|---------|---------|
| **PancakeSwap** | 0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E | 0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC |
| **SushiSwap** | 0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6 | 0xc35DADB65012eC5796536bD9864eD8773aBc74C4 |

---

## 🧪 测试步骤

### 方法1：使用 Truffle Console（推荐用于简单测试）

```bash
# 进入Truffle console
truffle console --network testnet
```

**基本验证：**
```javascript
// 1. 获取合约实例
const flashswap = await Flashswap.deployed()

// 2. 获取所有者
const owner = await flashswap.owner()
console.log("Owner:", owner)

// 3. 获取账户
const accounts = await web3.eth.getAccounts()
console.log("Your account:", accounts[0])

// 4. 查看余额
const balance = await web3.eth.getBalance(accounts[0])
console.log("Balance:", web3.utils.fromWei(balance, 'ether'), "BNB")
```

**测试 check() 函数（计算利润）：**
```javascript
// 参数示例
const _tokenBorrow = "0x78867BbEeF67c351045A0dd3a16838E9c72F4d78"  // BUSD
const _amountTokenPay = web3.utils.toWei("1", "ether")  // 1 BNB
const _tokenPay = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  // BNB
const _sourceRouter = "0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E"  // PancakeSwap
const _targetRouter = "0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6"  // SushiSwap

// 调用check函数
const [profit, amount] = await flashswap.check(
    _tokenBorrow,
    _amountTokenPay,
    _tokenPay,
    _sourceRouter,
    _targetRouter
)

console.log("Profit:", web3.utils.fromWei(profit, 'ether'), "BNB")
console.log("Amount:", web3.utils.fromWei(amount, 'ether'))
```

**测试 start() 函数（执行套利）：**
```javascript
// 仅当check()显示profit > 0时才执行start()

const maxBlockNumber = (await web3.eth.getBlockNumber()) + 100

const receipt = await flashswap.start(
    maxBlockNumber,
    _tokenBorrow,
    _amountTokenPay,
    _tokenPay,
    _sourceRouter,
    _targetRouter,
    "0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC"  // PancakeSwap Factory
)

console.log("Transaction hash:", receipt.tx)
console.log("Gas used:", receipt.receipt.gasUsed)
```

---

## 📊 测试场景

### 场景1：简单的直接套利

**假设：**
- PancakeSwap: 1 BNB = 400 BUSD
- SushiSwap: 400 BUSD = 1.1 BNB（有利润！）

**预期结果：**
- 借入400 BUSD
- 在SushiSwap交换为1.1 BNB
- 还款1 BNB
- 获利0.1 BNB

### 场景2：三角套利（Token A → B → C → A）

虽然当前代码主要支持2-token对，但可以扩展为三角套利

---

## ⚠️ 常见问题

### Q1: 为什么 check() 返回负数？
**A:** 这意味着没有套利机会。需要找到价差更大的交易对。

### Q2: 闪电贷费用是多少？
**A:** PancakeSwap收取0.25%手续费。需确保利润 > 0.25% 才有收益。

### Q3: 如何找到好的套利机会？
**A:**
1. 监听交易对价格变化
2. 使用多链数据聚合服务（如Dune Analytics）
3. 编写价格监听机器人
4. 关注新的流动性池

### Q4: Gas费用会很高吗？
**A:**
- 当前代码Gas用量约：100-150万
- 按10 Gwei计算：约0.01-0.015 BNB
- 利润必须 > Gas费用才划算

---

## 🔧 优化建议

### 1. 降低Gas成本
```javascript
// 使用更高效的代币交换方式
// 减少不必要的计算和存储操作
```

### 2. 支持多个DEX
```javascript
// 添加更多DEX的回调函数支持
// uniswapV3Call()
// quickPerpsCall()
```

### 3. 改进利润计算
```javascript
// 考虑滑点(slippage)
// 考虑交易对流动性不足的情况
// 添加动态Gas价格计算
```

### 4. 监听机制
```javascript
// 持续监听价格变化
// 自动触发套利
// 添加日志记录
```

---

## 🚀 部署到主网前的检查清单

- [ ] 在testnet上成功执行至少3次套利
- [ ] 验证利润计算正确无误
- [ ] 检查Gas消耗是否在预期范围内
- [ ] 确认所有DEX回调函数正常工作
- [ ] 完成安全审计（optional but recommended）
- [ ] 准备足够的BNB用于mainnet操作
- [ ] 制定风险管理策略

---

## 📚 相关资源

- [PancakeSwap文档](https://docs.pancakeswap.finance/)
- [Uniswap V2文档](https://docs.uniswap.org/contracts/v2/overview)
- [BSC文档](https://docs.bnbchain.org/)
- [闪电贷详解](https://docs.aave.com/developers/guides/flash-loans)

---

## 💡 下一步行动

1. **环境配置**
   - 部署额外的测试代币（如需要）
   - 配置监听服务

2. **交易测试**
   - 找到有套利机会的交易对
   - 执行check()验证利润
   - 执行start()进行实际套利

3. **生产准备**
   - 优化合约逻辑
   - 部署到主网
   - 启动机器人监听服务

---

祝您套利顺利！💰
