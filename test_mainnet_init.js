require('dotenv').config();
const Web3 = require('web3');
const BigNumber = require('bignumber.js');

const FlashswapApi = require('./abis/index').flashswapv2;
const Prices = require('./src/prices');

console.log('=== 主网初始化测试 ===');

const web3 = new Web3('https://bsc-dataseed.bnbchain.org:443');
const CONTRACT = process.env.CONTRACT;

const test = async () => {
    try {
        console.log('1. 获取钱包信息...');
        const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);
        console.log('✓ Admin:', admin);

        console.log('2. 获取 Nonce...');
        const nonce = await web3.eth.getTransactionCount(admin);
        console.log('✓ Nonce:', nonce);

        console.log('3. 获取 Gas Price...');
        const gasPrice = await web3.eth.getGasPrice();
        console.log('✓ Gas Price:', Web3.utils.fromWei(gasPrice, 'gwei'), 'Gwei');

        console.log('4. 初始化合约...');
        const flashswap = new web3.eth.Contract(FlashswapApi, CONTRACT);
        const owner = await flashswap.methods.owner().call();
        console.log('✓ Contract Owner:', owner);

        console.log('5. 获取价格...');
        const prices = await Prices.getPrices();
        console.log('✓ Prices loaded:', Object.keys(prices).length, 'tokens');

        console.log('6. 加载交易对...');
        const pairs = require('./src/pairs').getPairs();
        console.log('✓ Pairs:', pairs.map(p => p.name));

        console.log('7. 测试 check() 函数...');
        const pair = pairs[0];
        console.log('Testing pair:', pair.name);
        try {
            const check = await flashswap.methods.check(
                pair.tokenBorrow,
                new BigNumber(pair.amountTokenPay * 1e18),
                pair.tokenPay,
                pair.sourceRouter,
                pair.targetRouter
            ).call();
            console.log('✓ Check result:', {
                profit: check[0] / 1e18,
                amountOut: check[1] / 1e18
            });
        } catch (err) {
            console.warn('⚠️  Check failed:', err.message);
        }

        console.log('\n✅ 所有初始化步骤完成！主网监控已准备就绪。');
    } catch (err) {
        console.error('❌ 错误:', err.message);
        process.exit(1);
    }
};

test();
