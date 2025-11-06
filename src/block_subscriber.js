const Web3 = require('web3');
const {performance} = require('perf_hooks');
const net = require('net');

module.exports.subscribe = (providers, callback) => {
    let currentBlock = [0, performance.now()]

    providers.forEach(provider => {
        let providerName;
        let web3;
        let isWebSocket = provider.startsWith('wss') || provider.startsWith('ws');

        if (provider.endsWith('.ipc')) {
            providerName = 'ipc';
            web3 = new Web3(new Web3.providers.IpcProvider(provider, net));
        } else if (isWebSocket) {
            // WebSocket 连接
            providerName = new URL(provider).hostname;

            web3 = new Web3(new Web3.providers.WebsocketProvider(provider, {
                timeout: 30000,
                clientConfig: {
                    keepalive: true,
                    keepaliveInterval: 30000 // ms
                },
                reconnect: {
                    auto: true,
                    delay: 10000, // ms
                    maxAttempts: 1500,
                    onTimeout: false
                }})
            );

            // WebSocket 订阅
            web3.eth.subscribe('newBlockHeaders', (error, result) => {
                if (error) {
                    console.error('errorSubscription', error);
                    return;
                }
            }).on("connected", subscriptionId => {
                console.log(`[${providerName}] You are connected on ${subscriptionId}`);
            }).on('data', async (block) => {
                const [lastBlock, lastBlockTime] = currentBlock;
                if (block.number <= lastBlock) {
                    if (lastBlock === block.number && performance.now() - lastBlockTime < 500) {
                        callback(block, web3, providerName);
                    }
                    return;
                }

                currentBlock = [block.number, performance.now()];
                callback(block, web3, providerName);
            }).on('error', error => {
                console.warn(`⚠️  [${providerName}] 订阅错误: ${error.message}`);
            }).on('close', e => {
                console.warn(`⚠️  [${providerName}] 连接已关闭`)
            }).on('end', e => {
                console.warn(`⚠️  [${providerName}] 订阅已结束`)
            });
        } else {
            // HTTP RPC 连接 - 使用轮询
            providerName = new URL(provider).hostname;
            web3 = new Web3(new Web3.providers.HttpProvider(provider, {
                keepAlive: true,
                timeout: 30000
            }));

            console.log(`[${providerName}] 使用 HTTP RPC 轮询模式`);

            let lastBlockNum = 0;
            let errorCount = 0;
            let pollInterval = setInterval(async () => {
                try {
                    const blockNum = await web3.eth.getBlockNumber();

                    if (blockNum > lastBlockNum) {
                        const block = await web3.eth.getBlock(blockNum);
                        lastBlockNum = blockNum;
                        currentBlock = [block.number, performance.now()];
                        errorCount = 0; // 重置错误计数
                        callback(block, web3, providerName);
                    }
                } catch (error) {
                    errorCount++;
                    if (errorCount === 1) {
                        console.warn(`⚠️  [${providerName}] 轮询错误: ${error.message}`);
                    }
                    // 只显示第一次错误，之后继续静默轮询
                }
            }, 3000); // 每 3 秒轮询一次
        }
    });
}
