const hre = require("hardhat");

async function main() {
    let tx;
    let rt;
    let events;
    
    // 1. deploy target contract - testToken  
    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    console.log("1.  testToken deployed to:", testToken.address);
    console.log("1.1 testToken admin:", await testToken.owner());
    console.log("");

    // 2. deploy timelock contract - will be the onwer of testToken
    const Timelock = await hre.ethers.getContractFactory("Timelock");
    const address = "0x945e9704D2735b420363071bB935ACf2B9C4b814";
    const timelock = await Timelock.deploy([address], [address]);
    await timelock.deployed();
    console.log("2.  timelock deployed to:", timelock.address);
    console.log("2.2 transfer ownership of testToken to timelock")
    tx = await testToken.transferOwnership(timelock.address);
    await tx.wait(2);
    console.log("2.3 testToken admin:", await testToken.owner());
    console.log("");

    // const signer = await hre.ethers.getSigner();
    // const testToken = await hre.ethers.getContractAt("TestToken", "0xbed2C385cC263F474355F30312f7eCc722a9fe31", signer)
    // const timelock = await hre.ethers.getContractAt("Timelock", "0x2a50Ef86370Fc2226352b4DbAFE8fDE020BF9219", signer)

    // 3. read events at timelock contract
    const utils = hre.ethers.utils;
    const proposerRoleHash = utils.keccak256(utils.toUtf8Bytes("PROPOSER_ROLE"));
    const executeRoleHash = utils.keccak256(utils.toUtf8Bytes("EXECUTOR_ROLE"));

    const proposerRoleFilter = timelock.filters.RoleGranted();

    const deployedTxHash = timelock.deployTransaction.hash
    const provider = hre.ethers.provider;
    const txInfo = await provider.getTransaction(deployedTxHash);
    events =  await timelock.queryFilter(proposerRoleFilter, txInfo.blockNumber - 1)

    // events =  await timelock.queryFilter(proposerRoleFilter, 25831898)

    console.log("3. Roles in timelock contract:");
    for (e of events) {
        if (e.args.role === proposerRoleHash) {
            console.log(`proposer: ${e.args.account}`);
        } else if (e.args.role === executeRoleHash) {
            console.log(`executor: ${e.args.account}`);
        }
    }
    console.log("");


}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
