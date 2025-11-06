# 快速开始

## ⚡ 5分钟快速部署

### 1️⃣ 设置环境变量（.env）

```bash
PRIVATE_KEY=您的私钥
WSS_BLOCKS=wss://bsc-ws-node.nariox.org:443
CONTRACT=0x00000
```

### 2️⃣ 编译

```bash
truffle compile
```

### 3️⃣ 部署

```bash
truffle migrate --network testnet
```

---

## 🔗 网络配置已内置

| 网络 | RPC | Chain ID |
|------|-----|----------|
| **testnet** | https://data-seed-prebsc-1-s0.binance.org:8545/ | 97 |
| **mainnet** | http://127.0.0.1:8545/ | 56 |

---

## 📁 迁移脚本

✅ **已创建：**
- `migrations/1_initial_migration.js` - Migrations合约
- `migrations/2_deploy_flashswap.js` - Flashswap合约

---

## 🔧 配置已更新

`truffle-config.js` 已修改为：
- 从 `.env` 读取 `PRIVATE_KEY`
- 设置合适的 Gas 参数
- 添加了错误处理

---

## 📖 详细指南

查看 `DEPLOY_GUIDE.md` 获取完整说明

---

## ❓ 常见问题

**Q: 部署失败怎么办？**
A: 检查网络连接和PRIVATE_KEY格式，查看DEPLOY_GUIDE.md的故障排查章节

**Q: 部署地址保存在哪里？**
A:
- 终端输出中显示
- `build/contracts/Flashswap.json` 中保存
- 在 `DEPLOY_GUIDE.md` 中手动记录

**Q: 如何验证部署？**
A: 在 https://testnet.bscscan.com/ 搜索合约地址

---

## 🎯 部署成功后

```bash
# 查看合约地址（从构建文件中）
cat build/contracts/Flashswap.json | grep -A2 '"networks"'

# 或使用truffle console
truffle console --network testnet
> const fs = await Flashswap.deployed()
> fs.address
```

---

祝您成功！🚀
