/**
 * 交互式套利测试脚本
 * 让您手动输入参数测试套利
 */

const Flashswap = artifacts.require("Flashswap");

module.exports = async function(callback) {
  try {
    console.log("\n");
    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║           🔧 Flashswap 交互式测试工具 🔧                      ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    const flashswap = await Flashswap.deployed();
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];

    // ==================== 合约信息 ====================
    console.log("📍 合约信息");
    console.log("─────────────────────────────────────────────────────────\n");

    const owner = await flashswap.owner();
    const balance = await web3.eth.getBalance(deployer);
    const blockNumber = await web3.eth.getBlockNumber();

    console.log(`合约地址:    ${flashswap.address}`);
    console.log(`所有者:      ${owner}`);
    console.log(`当前账户:    ${deployer}`);
    console.log(`账户余额:    ${web3.utils.fromWei(balance, 'ether')} BNB`);
    console.log(`当前块号:    ${blockNumber}\n`);

    // ==================== BSC 测试网已知配置 ====================
    console.log("📋 BSC 测试网已知配置");
    console.log("─────────────────────────────────────────────────────────\n");

    console.log("已知代币地址:");
    console.log("  BNB (Wrapped):  0xae13d989dac2f0debff460ac112a837c89baa7cd");
    console.log("  USDT:           0x337610d27c682e347c9cd60bd4b3b107c9d34ddd");
    console.log("  ETH:            0x8babbb98678facc7342735bbb9737fc2d7c3ddd1\n");

    console.log("已知DEX信息:");
    console.log("  PancakeSwap Router: 0xD99D0564b02c0b83e6c5e9c47bD9f0eFCDE9b85E");
    console.log("  PancakeSwap Factory: 0xcA143Ce32Fe78f1f7019d7d551a6402aD98E0dcC");
    console.log("  SushiSwap Router:   0xd9e1cE17f2641f24aE4719F23D848bAb4c75c2e6\n");

    // ==================== 快速测试 ====================
    console.log("🧪 快速测试配置");
    console.log("─────────────────────────────────────────────────────────\n");

    console.log("本脚本提供3个快速测试配置，您可以：\n");

    console.log("选项1：手动测试 check() 函数");
    console.log("---------------------------------------");
    console.log("const result = await flashswap.check(");
    console.log("  '0xTokenBorrow',      // 借入的代币");
    console.log("  '1000000000000000000', // 金额 (wei)");
    console.log("  '0xTokenPay',         // 支付的代币");
    console.log("  '0xSourceRouter',     // 源DEX路由");
    console.log("  '0xTargetRouter'      // 目标DEX路由");
    console.log(")");
    console.log("const [profit, amount] = result");
    console.log("console.log('Profit:', web3.utils.fromWei(profit, 'ether'), 'BNB')\n");

    console.log("选项2：手动执行 start() 函数");
    console.log("---------------------------------------");
    console.log("const maxBlockNumber = blockNumber + 100");
    console.log("await flashswap.start(");
    console.log("  maxBlockNumber,");
    console.log("  '0xTokenBorrow',");
    console.log("  '1000000000000000000',");
    console.log("  '0xTokenPay',");
    console.log("  '0xSourceRouter',");
    console.log("  '0xTargetRouter',");
    console.log("  '0xSourceFactory'");
    console.log(")\n");

    console.log("选项3：检查交易对是否存在");
    console.log("---------------------------------------");
    console.log("const iface = new ethers.utils.Interface([");
    console.log("  'function getPair(address,address) view returns (address)'");
    console.log("])");
    console.log("const pairAddress = await factory.getPair(token0, token1)");
    console.log("console.log('Pair exists:', pairAddress !== '0x0000...')\n");

    // ==================== 合约函数说明 ====================
    console.log("📖 合约函数说明");
    console.log("─────────────────────────────────────────────────────────\n");

    console.log("1. check() 函数");
    console.log("   用途: 计算预期利润（不执行交易）");
    console.log("   返回: [profit, tokenBorrowAmount]");
    console.log("   • profit > 0: 有套利机会");
    console.log("   • profit <= 0: 无利可图\n");

    console.log("2. start() 函数");
    console.log("   用途: 执行真实套利交易");
    console.log("   流程: 闪电贷 -> 交换 -> 还款 -> 获利");
    console.log("   注意: 确保check()返回profit > 0后再执行\n");

    console.log("3. pancakeCall() 函数（及其他DEX回调）");
    console.log("   用途: DEX闪电贷的回调函数");
    console.log("   自动: 由合约自动调用，无需手动操作\n");

    // ==================== 下一步指导 ====================
    console.log("🎯 建议的下一步");
    console.log("─────────────────────────────────────────────────────────\n");

    console.log("Step 1: 退出此脚本 (按Ctrl+C)");
    console.log("        或在Truffle console中继续测试\n");

    console.log("Step 2: 进入Truffle console");
    console.log("        > truffle console --network testnet\n");

    console.log("Step 3: 获取合约实例");
    console.log("        > const fs = await Flashswap.deployed()\n");

    console.log("Step 4: 测试check()函数");
    console.log("        > const [p,a] = await fs.check(...参数...)");
    console.log("        > console.log('Profit:', web3.utils.fromWei(p))\n");

    console.log("Step 5: 如果profit > 0，执行start()函数");
    console.log("        > const maxBlock = await web3.eth.getBlockNumber() + 100");
    console.log("        > await fs.start(...参数...)");
    console.log("        > // 等待交易确认\n");

    console.log("Step 6: 验证收益");
    console.log("        > const newBalance = await web3.eth.getBalance(accounts[0])");
    console.log("        > console.log('New balance:', web3.utils.fromWei(newBalance))\n");

    // ==================== 常见问题 ====================
    console.log("❓ 常见问题");
    console.log("─────────────────────────────────────────────────────────\n");

    console.log("Q: 为什么check()返回execution reverted?");
    console.log("A: 可能原因:");
    console.log("   1. 交易对不存在（流动性不足）");
    console.log("   2. 代币地址错误");
    console.log("   3. DEX路由地址错误");
    console.log("   4. 测试网上该DEX可能没有该交易对\n");

    console.log("Q: 如何找到有套利机会的交易对?");
    console.log("A: 建议:");
    console.log("   1. 访问 https://testnet.pancakeswap.finance");
    console.log("   2. 查看哪些交易对有流动性");
    console.log("   3. 比较不同DEX的价格");
    console.log("   4. 在有价差的交易对上运行check()\n");

    console.log("Q: 利润为什么这么低或为负?");
    console.log("A: 需要考虑:");
    console.log("   1. 闪电贷费用: 0.25%");
    console.log("   2. 交换费用: 0.25-0.3% (取决于DEX)");
    console.log("   3. Gas成本: ~0.01 BNB");
    console.log("   4. 滑点影响: 大额交易会影响价格");
    console.log("   → 总成本 > 0.8%，价差必须足够大\n");

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                  准备好开始了吗？                             ║");
    console.log("║                                                                ║");
    console.log("║  运行: truffle console --network testnet                      ║");
    console.log("║  然后输入上面建议的命令进行测试！                             ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");

    callback();

  } catch (error) {
    console.error("\n❌ 错误:");
    console.error(error.message);
    callback(error);
  }
};
