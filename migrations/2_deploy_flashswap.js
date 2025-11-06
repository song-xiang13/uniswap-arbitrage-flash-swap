const Flashswap = artifacts.require("Flashswap");

module.exports = function(deployer, network, accounts) {
  console.log('');
  console.log('========================================');
  console.log(`Deploying Flashswap to ${network}`);
  console.log('========================================');
  console.log(`Deployer account: ${accounts[0]}`);
  console.log('');

  // Flashswap构造函数无需参数，owner会自动设置为部署者
  deployer.deploy(Flashswap)
    .then((instance) => {
      console.log('✓ Flashswap deployed successfully!');
      console.log(`✓ Contract address: ${instance.address}`);
      console.log(`✓ Owner: ${accounts[0]}`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Update .env file with CONTRACT=' + instance.address);
      console.log('2. Verify contract on block explorer');
      console.log('3. Test the start() function with your arbitrage parameters');
      console.log('');
    })
    .catch((error) => {
      console.error('✗ Deployment failed:', error);
      throw error;
    });
};
