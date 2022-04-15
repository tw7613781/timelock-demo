const hre = require("hardhat");
const crypto = require('crypto');
const utils = hre.ethers.utils;

async function main() {
    let tx;
    let events;
    const signer = await hre.ethers.getSigner();
    const address = await signer.getAddress();
    
    // 1. deploy target contract - testToken  
    const TestToken = await hre.ethers.getContractFactory("TestToken");
    const testToken = await TestToken.deploy();
    await testToken.deployed();
    console.log("1.  testToken deployed to:", testToken.address);
    console.log("1.1 testToken admin:", await testToken.owner());
    console.log("");

    // 2. deploy timelock contract - will be the onwer of testToken
    const Timelock = await hre.ethers.getContractFactory("Timelock");
    const timelock = await Timelock.deploy([address], [address]);
    await timelock.deployed();
    console.log("2.  timelock deployed to:", timelock.address);
    console.log("2.2 transfer ownership of testToken to timelock")
    tx = await testToken.transferOwnership(timelock.address);
    // // need conformation in remote blockchain
    // await tx.wait(2);
    console.log("2.3 testToken admin:", await testToken.owner());
    console.log("");

    console.log(`3.  signer: ${await signer.getAddress()}\n`)

    // // load contract from known address
    // const testToken = await hre.ethers.getContractAt("TestToken", "0x9E6Fa781a5cc3CE5ec617aaEE9009EE1EE653971", signer)
    // const timelock = await hre.ethers.getContractAt("Timelock", "0x21C6aeBa5Dd3f2CEe0e3743Dd9bd8EDaD3bb22EF", signer)

    // 4. read events at timelock contract
    const proposerRoleHash = utils.keccak256(utils.toUtf8Bytes("PROPOSER_ROLE"));
    const executeRoleHash = utils.keccak256(utils.toUtf8Bytes("EXECUTOR_ROLE"));

    const proposerRoleFilter = timelock.filters.RoleGranted();

    const deployedTxHash = timelock.deployTransaction.hash
    const provider = hre.ethers.provider;
    const txInfo = await provider.getTransaction(deployedTxHash);
    const filterStartBlockNumber = txInfo.blockNumber - 1;

    events =  await timelock.queryFilter(proposerRoleFilter, filterStartBlockNumber)

    // events =  await timelock.queryFilter(proposerRoleFilter, 25831898)

    console.log("4.  roles in timelock contract:");
    for (e of events) {
        if (e.args.role === proposerRoleHash) {
            console.log(`proposer: ${e.args.account}`);
        } else if (e.args.role === executeRoleHash) {
            console.log(`executor: ${e.args.account}`);
        }
    }
    console.log("");

    // 5. make a schedule job
    console.log(`5.  make a schedule job to mint TestToken`);
    const salt = '0x' + crypto.randomBytes(32).toString('hex');
    const {target, value, data, predecessor, delay} = await mintProposal(testToken, address, '1.24', salt);
    console.log(`5.1 target: ${target}`);
    console.log(`5.2 value: ${value}`);
    console.log(`5.3 data: ${data}`);
    console.log(`5.4 predecessor: ${predecessor}`);
    console.log(`5.5 salt: ${salt}`);
    console.log(`5.6 delay: ${delay}`);
    tx = await timelock.schedule(target, value, data, predecessor, salt, delay);
    const id = computerId(target, value, data, predecessor, salt);
    console.log(`5.7 job id: ${id}`);
    // await tx.wait(2);
    console.log(`sent with TX hash ${tx.hash}\n`);

    const callScheduledFilter = timelock.filters.CallScheduled();
    events =  await timelock.queryFilter(callScheduledFilter, filterStartBlockNumber)
    console.log("6.  scheduled job history");
    for (e of events) {
        console.log(`id: ${e.args.id}`);
        console.log(`index: ${e.args.index}`);
        console.log(`target: ${e.args.target}`);
        console.log(`value: ${e.args.value}`);
        console.log(`data: ${e.args.data}`);
        console.log(`predecessor: ${e.args.predecessor}`);
        console.log(`delay: ${e.args.delay}\n`);
    }
    console.log("");

    console.log(`7.  sleep ${delay} seconds until the job is ready\n`)
    await sleep(delay * 1000);

    console.log(`8.  execute the scheduled job`);
    tx = await timelock.execute(target, value, data, predecessor, salt);
    console.log(`sent with TX hash ${tx.hash}\n`);

    const callExecutedFilter = timelock.filters.CallExecuted();
    events =  await timelock.queryFilter(callExecutedFilter, filterStartBlockNumber)
    console.log("9.  called job history");
    for (e of events) {
        console.log(`id: ${e.args.id}`);
        console.log(`index: ${e.args.index}`);
        console.log(`target: ${e.args.target}`);
        console.log(`value: ${e.args.value}`);
        console.log(`data: ${e.args.data}\n`);
    }
    console.log("");

    console.log('10.  check balance on TestToken');
    const balance = await testToken.balanceOf(address);
    console.log(`${address} balance: ${balance}`);
}

function computerId(target, value, data, predecessor, salt) {
    const abiCoder = new utils.AbiCoder();
    const encodeData = abiCoder.encode(["address", "uint256", "bytes", "bytes32", "bytes32"], [target, value, data, predecessor, salt]);
    return utils.keccak256(encodeData);
}

async function mintProposal(testToken, address, num, salt, delay = 15) {
    const unsignTx = await testToken.populateTransaction.mint(address, utils.parseEther(num));
    const target = unsignTx.to;
    const value  = 0;
    const data = unsignTx.data;
    const predecessor = '0x0000000000000000000000000000000000000000000000000000000000000000'
    
    return {target, value, data, predecessor, delay}
}

async function sleep(milli) {
    return new Promise( (resolve, reject) => {
        setTimeout( () => {
            resolve();
        }, milli)
    })
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
