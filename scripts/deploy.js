// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + 10;
  const EIP_191_PREFIX = Buffer.from('1901', 'hex');

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime);

  await lock.deployed();
  console.log("Lock with 1 ETH deployed to:", lock.address);

  // Generate a random private key
  const privateKey =
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  const signingKey = new ethers.utils.SigningKey(privateKey);

  const typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      withdraw: [
        { name: "_owner", type: "address" },
        { name: "_myParam", type: "uint256" },
      ],
    },
    domain: {
      name: "Lock",
      version: "1",
      chainId: 31337,
      verifyingContract: lock.address,
    },
    primaryType: "withdraw",
    message: {
      _owner: signer.address,
      _myParam: 1000000,
    },
  };

  const message = getMessage(typedData, true);

  // Sign the message with the private key
  const { r, s, v } = signingKey.signDigest(message);

  console.log(`Message: 0x${bytesToHex(message)}`);
  console.log(`Signature: (${r}, ${s}, ${v})`);
}

const getMessage = async () => {
  const domain_separator = ethers.utils.keccak256(typedData.types, typedData.domain)
  const message = Buffer.concat([
    EIP_191_PREFIX,
    
  ]);
}


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
