# 部署后操作步骤（完整清单）

## ✅ 已完成

- [x] 合约编译
- [x] 部署到BSC测试网
- [x] 验证合约基本功能
- [x] 更新.env配置文件

---

## 🔄 现在可以做的事情

### **阶段1：验证与测试（1-2小时）**

#### 1.1 在区块浏览器查看合约
- [ ] 打开 https://testnet.bscscan.com/address/0x4079167FD24C10d4795a7Bc6c714DAAe5f04e138
- [ ] 验证合约代码
- [ ] 查看交易历史
- [ ] 检查所有者地址

#### 1.2 使用 Truffle Console 进行交互式测试
```bash
truffle console --network testnet
```
- [ ] 验证合约所有者
- [ ] 检查合约余额
- [ ] 调用view函数测试

#### 1.3 测试 check() 函数
```javascript
// 选择一对交易所和代币
// 计算预期利润
// 验证结果是否合理
```

---

### **阶段2：找到套利机会（2-6小时）**

#### 2.1 分析交易对价差
需要找到这样的机会：
```
PancakeSwap: 1 BNB = 400 BUSD
SushiSwap:  400 BUSD = 1.05+ BNB（利润）
```

**检查方向：**
- [ ] BNB ↔ BUSD
- [ ] BNB ↔ USDT
- [ ] BUSD ↔ USDT
- [ ] 其他交易对

#### 2.2 使用工具分析
- [ ] 访问DeFi交易所比较网站
- [ ] 检查PancakeSwap官网的交易对
- [ ] 检查SushiSwap官网的交易对
- [ ] 记录有价差的交易对

#### 2.3 计算净利润
```
总利润 = 交换利润 - 闪电贷费用(0.25%) - Gas费用(~0.01 BNB)
```

必须满足：总利润 > 0

---

### **阶段3：测试执行套利（1-2小时）**

#### 3.1 第一次测试执行
```javascript
// 使用找到的最佳交易对
// 调用start()函数
// 观察交易结果
```

- [ ] 交易成功确认
- [ ] 验证利润转入钱包
- [ ] 查看Gas使用情况

#### 3.2 多次测试不同交易对
- [ ] 测试交易对1
- [ ] 测试交易对2
- [ ] 测试交易对3
- [ ] 记录成功率和利润

#### 3.3 优化参数
- [ ] 调整amountTokenPay
- [ ] 尝试不同的maxBlockNumber
- [ ] 优化Gas价格

---

### **阶段4：性能与安全评估（1-2小时）**

#### 4.1 性能指标评估
- [ ] 平均Gas消耗
- [ ] 平均交易成本
- [ ] 平均利润率
- [ ] 成功率

#### 4.2 风险评估
- [ ] 流动性风险：价格滑点是否可控？
- [ ] 闪电贷费用：是否影响利润？
- [ ] 区块确认：是否存在MEV风险？
- [ ] 合约安全：代码是否有漏洞？

#### 4.3 监听机制验证
- [ ] pancakeCall回调是否正常触发？
- [ ] 代币转账是否成功？
- [ ] 利润分发是否正确？

---

### **阶段5：准备上线到主网（1-2小时）**

#### 5.1 资金准备
- [ ] 准备足够的BNB用于Gas
- [ ] 准备交易资金
- [ ] 计算每日预期收益

#### 5.2 监听机器人准备
选择一个：
```
选项A: 使用现有的事件监听脚本
选项B: 开发自己的监听机器人
选项C: 使用第三方套利服务
```

- [ ] 确定监听方案
- [ ] 配置监听参数
- [ ] 测试监听功能

#### 5.3 合约审计与验证
- [ ] 代码审查
- [ ] 安全审计（可选但推荐）
- [ ] 测试覆盖率检查

#### 5.4 部署前检查清单
- [ ] 合约代码无误
- [ ] 环境变量正确
- [ ] RPC端点可用
- [ ] 钱包有足够余额
- [ ] Gas价格合理

---

## 📝 具体操作指南

### 查看合约地址信息
```bash
# 方法1: 在区块浏览器查看
https://testnet.bscscan.com/address/0x4079167FD24C10d4795a7Bc6c714DAAe5f04e138

# 方法2: 使用truffle console
truffle console --network testnet
> const fs = await Flashswap.deployed()
> fs.address
> await fs.owner()
```

### 测试check()函数
```bash
truffle console --network testnet
```
```javascript
const fs = await Flashswap.deployed()
const tokenBorrow = "0x78867BbEeF67c351045A0dd3a16838E9c72F4d78"  // BUSD
const amountTokenPay = web3.utils.toWei("1", "ether")  // 1 BNB
const tokenPay = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"  // BNB
const sourceRouter = "0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E"  // PancakeSwap
const targetRouter = "0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6"  // SushiSwap

const [profit, amount] = await fs.check(
    tokenBorrow,
    amountTokenPay,
    tokenPay,
    sourceRouter,
    targetRouter
)

console.log("Profit:", web3.utils.fromWei(profit, 'ether'))
```

### 执行start()函数
```javascript
// 仅当profit > 0时执行
const maxBlockNumber = (await web3.eth.getBlockNumber()) + 100
const sourceFactory = "0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC"  // PancakeSwap Factory

const tx = await fs.start(
    maxBlockNumber,
    tokenBorrow,
    amountTokenPay,
    tokenPay,
    sourceRouter,
    targetRouter,
    sourceFactory
)

console.log("Transaction:", tx.tx)
```

---

## 🎯 建议的时间安排

| 阶段 | 任务 | 时间 | 优先级 |
|------|------|------|--------|
| 1 | 验证与测试 | 1-2小时 | 🔴 必做 |
| 2 | 找套利机会 | 2-6小时 | 🔴 必做 |
| 3 | 测试执行 | 1-2小时 | 🔴 必做 |
| 4 | 性能评估 | 1-2小时 | 🟡 强烈推荐 |
| 5 | 上线准备 | 1-2小时 | 🟡 强烈推荐 |

---

## ⚠️ 注意事项

1. **不要急于上线到主网**
   - 必须在testnet完整测试至少3-5次
   - 验证所有风险场景

2. **监控Gas价格**
   - 高Gas会吃掉利润
   - 选择合适的执行时机

3. **避免抢跑(Frontrunning)**
   - Mempool中的交易可能被抢跑
   - 考虑使用flashbots或其他抗MEV方案

4. **定期更新监听**
   - DEX接口可能更新
   - 流动性池可能变化
   - 新的套利机会可能出现

5. **备份关键数据**
   - 备份private key
   - 记录所有部署信息
   - 保存合约源代码

---

## 📞 需要帮助？

- 阅读本目录下的文档：
  - DEPLOY_GUIDE.md - 详细部署指南
  - QUICK_START.md - 快速参考
  - ARBITRAGE_TEST.md - 套利测试指南

- 查看合约代码：contracts/Flashswap.sol

- 访问资源：
  - BSC Testnet浏览器: https://testnet.bscscan.com
  - PancakeSwap: https://testnet.pancakeswap.finance
  - SushiSwap: https://app.sushi.com

---

祝您套利成功！💰🚀
