// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    console.log("testToken deployed to:", testToken.address);
    console.log("testToken admin:", await testToken.owner());
    
    const Timelock = await hre.ethers.getContractFactory("Timelock");
    const address = "0x945e9704D2735b420363071bB935ACf2B9C4b814";
    const timelock = await Timelock.deploy([address], [address]);
    console.log("timelock deployed to:", timelock.address);
    console.log("transfer ownership of testToken to timelock")
    await testToken.transferOwnership(timelock.address);
    console.log("testToken admin:", await testToken.owner());

    // polygon_test
    // testToken: 0x1ADabbb86ae76b1B74874DC207b3ec695Ff4B3AD
    // timeLock: 0xa29C3686BBC32eda96C2F99bb08Ad9e26a217394
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
