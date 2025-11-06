// 主网配置
const pancake_mainnet = {
    router: "0x10ed43c718714eb63d5aa57b78b54704e256024e",
    factory: "0xca143ce32fe78f1f7019d7d551a6402fc5350c73",
    routerV1: "0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F",
    factoryV1: "0xBCfCcbde45cE874adCB698cC183deBcF17952812"
};
const sushi_mainnet = {
    router: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    factory: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4"
};

// 测试网配置
const pancake_testnet = {
    router: "0xd99d0564b02c0b83e6c5e9c47bd9f0efcde9b85e",
    factory: "0xca143ce32fe78f1f7019d7d551a6402ad98e0dcc"
};
const sushi_testnet = {
    router: "0xd9e1ce17f2641f24ae4719f23d848bab4c75c2e6",
    factory: "0xc35dadb65012ec5796536bd9864ed8773abc74c4"
};

module.exports.getPairs = () => {

    // 检查是否为测试网（通过WSS_BLOCKS环境变量）
    const isTestnet = (process.env.WSS_BLOCKS || '').includes('testnet');

    if (isTestnet) {
        // 测试网配置
        const WBNB_TESTNET = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
        const ETH_TESTNET = '0x8babbb98678facc7342735bbb9737fc2d7c3ddd1';

        const pairs = [
            {
                name: 'WBNB/ETH pancakeswap>sushiswap',
                tokenBorrow: ETH_TESTNET,
                amountTokenPay: 0.1,
                tokenPay: WBNB_TESTNET,
                sourceRouter: pancake_testnet.router,
                targetRouter: sushi_testnet.router,
                sourceFactory: pancake_testnet.factory,
            }
        ];

        return pairs;
    } else {
        // 主网配置
        const USDT_MAINNET = '0x55d398326f99059ff775485246999027b3197955';
        const BNB_MAINNET = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

        const pairs = [
            {
                name: 'BNB/USDT pancakeswap>sushiswap',
                tokenBorrow: BNB_MAINNET,  // 借 BNB
                amountTokenPay: 0.01,       // 20 USDT 大约是 0.01 BNB，先用小额测试
                tokenPay: USDT_MAINNET,     // 用 USDT 还
                sourceRouter: pancake_mainnet.router,
                targetRouter: sushi_mainnet.router,
                sourceFactory: pancake_mainnet.factory,
            },
            {
                name: 'BNB/USDT sushiswap>pancakeswap',
                tokenBorrow: BNB_MAINNET,   // 借 BNB
                amountTokenPay: 0.01,       // 小额测试
                tokenPay: USDT_MAINNET,     // 用 USDT 还
                sourceRouter: sushi_mainnet.router,
                targetRouter: pancake_mainnet.router,
                sourceFactory: sushi_mainnet.factory,
            }
        ];

        return pairs;
    }
}