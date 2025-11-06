/**
 * 完整的套利执行脚本
 * 自动化完成：1. 验证合约 2. 检查利润 3. 执行套利
 */

const Flashswap = artifacts.require("Flashswap");
const Web3 = require("web3");

// BSC 测试网主要代币地址
const TOKENS = {
  BNB: "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
  BUSD: "0x78867bbeef67c351045a0dd3a16838e9c72f4d78",
  USDT: "0x7ef95a0fee0dd31b22626649937b0a1418aaeba1",
  WBNB: "0xae13d989dac2f0debff460ac112a837c89baa7cd"
};

// DEX 路由地址
const ROUTERS = {
  PancakeSwap: "0xd99d0564b02c0b83e6c5e9c47bd9f0efcde9b85e",
  SushiSwap: "0xd9e1ce17f2641f24ae4719f23d848bab4c75c2e6"
};

const FACTORIES = {
  PancakeSwap: "0xca143ce32fe78f1f7019d7d551a6402ad98e0dcc"
};

module.exports = async function(callback) {
  try {
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║              🚀 Flashswap 套利执行脚本 🚀                     ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const flashswap = await Flashswap.deployed();
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    // ==================== 第1步：验证合约 ====================
    console.log("📋 第1步：验证合约和账户信息");
    console.log("─────────────────────────────────────────────────────────\n");

    const owner = await flashswap.owner();
    const balance = await web3.eth.getBalance(deployer);
    const blockNumber = await web3.eth.getBlockNumber();

    console.log(`✓ 合约地址:       ${flashswap.address}`);
    console.log(`✓ 所有者:         ${owner}`);
    console.log(`✓ 部署者:         ${deployer}`);
    console.log(`✓ 所有者匹配:     ${owner === deployer ? "✅ 是" : "❌ 否"}`);
    console.log(`✓ 当前块号:       ${blockNumber}`);
    console.log(`✓ 账户余额:       ${web3.utils.fromWei(balance, 'ether')} BNB\n`);

    if (owner !== deployer) {
      console.log("❌ 所有者不匹配！合约由其他地址创建\n");
      callback(new Error("Owner mismatch"));
      return;
    }

    // ==================== 第2步：测试套利对 ====================
    console.log("📊 第2步：测试套利机会 (BNB -> BUSD -> BNB)");
    console.log("─────────────────────────────────────────────────────────\n");

    // 测试参数
    const testPairs = [
      {
        name: "BNB -> BUSD (PancakeSwap to SushiSwap)",
        tokenBorrow: TOKENS.BUSD,
        amountTokenPay: web3.utils.toWei("0.1", "ether"),  // 0.1 BNB
        tokenPay: TOKENS.BNB,
        sourceRouter: ROUTERS.PancakeSwap,
        targetRouter: ROUTERS.SushiSwap
      },
      {
        name: "BNB -> USDT (PancakeSwap to SushiSwap)",
        tokenBorrow: TOKENS.USDT,
        amountTokenPay: web3.utils.toWei("0.1", "ether"),  // 0.1 BNB
        tokenPay: TOKENS.BNB,
        sourceRouter: ROUTERS.PancakeSwap,
        targetRouter: ROUTERS.SushiSwap
      }
    ];

    let profitableOpportunity = null;

    for (let i = 0; i < testPairs.length; i++) {
      const pair = testPairs[i];
      console.log(`🔍 测试 #${i + 1}: ${pair.name}`);

      try {
        const [profit, amount] = await flashswap.check(
          pair.tokenBorrow,
          pair.amountTokenPay,
          pair.tokenPay,
          pair.sourceRouter,
          pair.targetRouter
        );

        const profitBNB = web3.utils.fromWei(profit, 'ether');
        const amountBNB = web3.utils.fromWei(amount, 'ether');

        console.log(`  • 支付: ${web3.utils.fromWei(pair.amountTokenPay, 'ether')} BNB`);
        console.log(`  • 借入: ${amountBNB} 代币`);
        console.log(`  • 利润: ${profitBNB} BNB`);

        if (parseFloat(profitBNB) > 0) {
          console.log(`  ✅ 有套利机会！\n`);
          if (!profitableOpportunity || parseFloat(profitBNB) > parseFloat(profitableOpportunity.profit)) {
            profitableOpportunity = {
              ...pair,
              profit: profitBNB,
              amount: amountBNB
            };
          }
        } else {
          console.log(`  ❌ 无利可图\n`);
        }
      } catch (error) {
        console.log(`  ⚠️  检查失败: ${error.message.substring(0, 50)}...\n`);
      }
    }

    // ==================== 第3步：执行套利 ====================
    if (profitableOpportunity) {
      console.log("\n💰 第3步：执行最优套利机会");
      console.log("─────────────────────────────────────────────────────────\n");

      console.log(`🎯 选择方案: ${profitableOpportunity.name}`);
      console.log(`💵 预期利润: ${profitableOpportunity.profit} BNB`);
      console.log(`📈 借入金额: ${profitableOpportunity.amount}\n`);

      const maxBlockNumber = blockNumber + 100;

      console.log(`⏳ 执行交易中...（最大块号: ${maxBlockNumber}）\n`);

      const tx = await flashswap.start(
        maxBlockNumber,
        profitableOpportunity.tokenBorrow,
        profitableOpportunity.amountTokenPay,
        profitableOpportunity.tokenPay,
        profitableOpportunity.sourceRouter,
        profitableOpportunity.targetRouter,
        FACTORIES.PancakeSwap
      );

      console.log(`✅ 交易已发送`);
      console.log(`  • 交易Hash: ${tx.tx}`);
      console.log(`  • Gas使用:  ${tx.receipt.gasUsed} gas`);
      console.log(`  • Gas成本:  ${web3.utils.fromWei(tx.receipt.gasUsed * 10000000000, 'ether')} BNB (10 Gwei)\n`);

      // ==================== 第4步：验证结果 ====================
      console.log("✨ 第4步：验证套利结果");
      console.log("─────────────────────────────────────────────────────────\n");

      const newBalance = await web3.eth.getBalance(deployer);
      const balanceChange = newBalance - balance;
      const balanceChangeBNB = web3.utils.fromWei(balanceChange, 'ether');

      console.log(`💰 余额变化: ${balanceChangeBNB} BNB`);
      console.log(`✓ 新余额: ${web3.utils.fromWei(newBalance, 'ether')} BNB`);

      if (parseFloat(balanceChangeBNB) > 0) {
        console.log(`\n🎉 套利成功！获利 ${balanceChangeBNB} BNB\n`);
      } else {
        console.log(`\n⚠️  余额减少 ${Math.abs(parseFloat(balanceChangeBNB))} BNB (包括Gas费)\n`);
      }

    } else {
      console.log("\n❌ 未找到有利可图的套利机会\n");
      console.log("提示:");
      console.log("  1. 价差可能太小");
      console.log("  2. 流动性不足");
      console.log("  3. 可以尝试其他交易对");
      console.log("  4. 可以尝试更大的交易金额\n");
    }

    // ==================== 完成 ====================
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                     ✅ 执行完成 ✅                            ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    callback();

  } catch (error) {
    console.error("\n❌ 执行出错:");
    console.error(error.message);
    console.error("\n");
    callback(error);
  }
};
