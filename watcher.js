require('dotenv').config();
const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const {performance} = require('perf_hooks');

const FlashswapApi = require('./abis/index').flashswapv2;
const BlockSubscriber = require('./src/block_subscriber');
const Prices = require('./src/prices');

let FLASHSWAP_CONTRACT = process.env.CONTRACT;

// 延迟加载 TransactionSender（避免初始化时卡住）
let TransactionSender = null;

const fs = require('fs');
const util = require('util');
var log_file = fs.createWriteStream(__dirname + '/log_arbitrage.txt', { flags: 'w' });
var log_stdout = process.stdout;
console.log = function (d) {
    log_file.write(util.format(d) + '\n');
    log_stdout.write(util.format(d) + '\n');
};

// 创建 Web3 连接，优先使用 HTTP RPC（更稳定）
let rpcUrl = process.env.WSS_BLOCKS;
let isWebSocket = rpcUrl && rpcUrl.startsWith('wss');

let provider;
if (isWebSocket) {
    provider = new Web3.providers.WebsocketProvider(rpcUrl, {
        reconnect: {
            auto: true,
            delay: 5000,
            maxAttempts: 15,
            onTimeout: false
        }
    });
} else if (rpcUrl && rpcUrl.startsWith('ws')) {
    provider = new Web3.providers.WebsocketProvider(rpcUrl, {
        reconnect: {
            auto: true,
            delay: 5000,
            maxAttempts: 15,
            onTimeout: false
        }
    });
} else {
    // 回退到 HTTP RPC
    const httpUrl = rpcUrl ? rpcUrl.replace('wss://', 'https://').replace('ws://', 'http://') : 'https://bsc-dataseed.bnbchain.org:443';
    console.log('使用 HTTP RPC: ' + httpUrl);
    provider = new Web3.providers.HttpProvider(httpUrl, {
        keepAlive: true,
        timeout: 30000
    });
}

const web3 = new Web3(provider);

const { address: admin } = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY);

const prices = {};
const flashswap = new web3.eth.Contract(FlashswapApi, FLASHSWAP_CONTRACT);

const pairs = require('./src/pairs').getPairs();

const init = async () => {
    console.log('starting: ', JSON.stringify(pairs.map(p => p.name)));

    let nonce = await web3.eth.getTransactionCount(admin);
    let gasPrice = await web3.eth.getGasPrice();

    setInterval(async () => {
        nonce = await web3.eth.getTransactionCount(admin);
    }, 1000 * 19);

    setInterval(async () => {
        gasPrice = await web3.eth.getGasPrice()
    }, 1000 * 60 * 3);

    const owner = await flashswap.methods.owner().call();

    console.log(`started: wallet ${admin} - gasPrice ${gasPrice} - contract owner: ${owner}`);

    // 延迟初始化 TransactionSender（避免一开始就建立大量连接）
    let transactionSender = null;
    setTimeout(() => {
        console.log('初始化交易发送器...');
        if (!TransactionSender) {
            TransactionSender = require('./src/transaction_send');
        }
        transactionSender = TransactionSender.factory(process.env.WSS_BLOCKS.split(','));
        console.log('✓ 交易发送器已初始化');
    }, 5000);

    let handler = async () => {
        try {
            const myPrices = await Prices.getPrices();
            if (Object.keys(myPrices).length > 0) {
                for (const [key, value] of Object.entries(myPrices)) {
                    prices[key.toLowerCase()] = value;
                }
                console.log('✓ 价格已更新:', Object.keys(myPrices).length, '个代币');
            }
        } catch (e) {
            console.warn('❌ 获取价格失败:', e.message, '- 使用默认价格');
        }
    };

    await handler();
    setInterval(handler, 1000 * 60 * 5);

    const onBlock = async (block, web3, provider) => {
        const start = performance.now();

        const calls = [];

        const flashswap = new web3.eth.Contract(FlashswapApi, FLASHSWAP_CONTRACT);

        pairs.forEach((pair) => {
            calls.push(async () => {
                const check = await flashswap.methods.check(pair.tokenBorrow, new BigNumber(pair.amountTokenPay * 1e18), pair.tokenPay, pair.sourceRouter, pair.targetRouter).call();

                const profit = check[0];

                let s = pair.tokenPay.toLowerCase();
                const price = prices[s];
                if (!price) {
                    console.log('invalid price', pair.tokenPay);
                    return;
                }

                const profitUsd = profit / 1e18 * price;
                const percentage = (100 * (profit / 1e18)) / pair.amountTokenPay;
                console.log(`[${block.number}] [${new Date().toLocaleString()}]: [${provider}] [${pair.name}] Arbitrage checked! Expected profit: ${(profit / 1e18).toFixed(3)} $${profitUsd.toFixed(2)} - ${percentage.toFixed(2)}%`);

                if (profit > 0) {
                    console.log(`[${block.number}] [${new Date().toLocaleString()}]: [${provider}] [${pair.name}] Arbitrage opportunity found! Expected profit: ${(profit / 1e18).toFixed(3)} $${profitUsd.toFixed(2)} - ${percentage.toFixed(2)}%`);

                    const tx = flashswap.methods.start(
                        block.number + 2,
                        pair.tokenBorrow,
                        new BigNumber(pair.amountTokenPay * 1e18),
                        pair.tokenPay,
                        pair.sourceRouter,
                        pair.targetRouter,
                        pair.sourceFactory,
                    );

                    let estimateGas
                    try {
                        estimateGas = await tx.estimateGas({from: admin});
                    } catch (e) {
                        console.log(`[${block.number}] [${new Date().toLocaleString()}]: [${pair.name}]`, 'gasCost error', e.message);
                        return;
                    }

                    const myGasPrice = new BigNumber(gasPrice).plus(gasPrice * 0.2212).toString();
                    const txCostBNB = Web3.utils.toBN(estimateGas) * Web3.utils.toBN(myGasPrice);

                    const BNB_ADDRESS = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'; // mainnet WBNB
                    let gasCostUsd = (txCostBNB / 1e18) * prices[BNB_ADDRESS.toLowerCase()];
                    const profitMinusFeeInUsd = profitUsd - gasCostUsd;

                    if (profitMinusFeeInUsd < 0.1) {
                        console.log(`[${block.number}] [${new Date().toLocaleString()}] [${provider}]: [${pair.name}] stopped: `, JSON.stringify({
                            profit: "$" + profitMinusFeeInUsd.toFixed(2),
                            profitWithoutGasCost: "$" + profitUsd.toFixed(2),
                            gasCost: "$" + gasCostUsd.toFixed(2),
                            duration: `${(performance.now() - start).toFixed(2)} ms`,
                            provider: provider,
                            myGasPrice: myGasPrice.toString(),
                            txCostBNB: txCostBNB / 1e18,
                            estimateGas: estimateGas,
                        }));
                    }

                    if (profitMinusFeeInUsd > 0.1) {
                        console.log(`[${block.number}] [${new Date().toLocaleString()}] [${provider}]: [${pair.name}] and go: `, JSON.stringify({
                            profit: "$" + profitMinusFeeInUsd.toFixed(2),
                            profitWithoutGasCost: "$" + profitUsd.toFixed(2),
                            gasCost: "$" + gasCostUsd.toFixed(2),
                            duration: `${(performance.now() - start).toFixed(2)} ms`,
                            provider: provider,
                        }));

                        const data = tx.encodeABI();
                        const txData = {
                            from: admin,
                            to: flashswap.options.address,
                            data: data,
                            gas: estimateGas,
                            gasPrice: new BigNumber(myGasPrice),
                            nonce: nonce
                        };

                        let number = performance.now() - start;
                        if (number > 1500) {
                            console.error('out of time window: ', number);
                            return;
                        }

                        console.log(`[${block.number}] [${new Date().toLocaleString()}] [${provider}]: sending transactions...`, JSON.stringify(txData))

                        if (transactionSender) {
                            try {
                                await transactionSender.sendTransaction(txData);
                            } catch (e) {
                                console.error('transaction error', e);
                            }
                        } else {
                            console.warn('⚠️  交易发送器尚未初始化，跳过交易');
                        }
                    }
                }
            })
        })

        try {
            await Promise.all(calls.map(fn => fn()));
        } catch (e) {
            console.warn(`[${block.number}] Block processing error: ${e.message}`);
        }

        let number = performance.now() - start;
        if (number > 1500) {
            console.error('warning to slow', number);
        }

        if (block.number % 40 === 0) {
            console.log(`[${block.number}] [${new Date().toLocaleString()}]: alive (${provider}) - took ${number.toFixed(2)} ms`);
        }
    };

    BlockSubscriber.subscribe(process.env.WSS_BLOCKS.split(','), onBlock);
}

init();
