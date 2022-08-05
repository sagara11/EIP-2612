// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");
const EIP_191_PREFIX = Buffer.from("1901", "hex");

async function main() {
  const [signer] = await ethers.getSigners();
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + 10;

  const lockedAmount = hre.ethers.utils.parseEther("1");

  const Lock = await hre.ethers.getContractFactory("Lock");
  const lock = await Lock.deploy(unlockTime);

  await lock.deployed();
  console.log("Lock with 1 ETH deployed to:", lock.address);

  // Generate a random private key

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

  const domain = typedData.domain;
  const types = {
    withdraw: [
      { name: "_owner", type: "address" },
      { name: "_myParam", type: "uint256" },
    ],
  };
  const value = typedData.message;

  let signature = await signer._signTypedData(domain, types, value);

  signature = signature.substring(2);
  const r = "0x" + signature.substring(0, 64);
  const s = "0x" + signature.substring(64, 128);
  const v = parseInt(signature.substring(128, 130), 16);

  console.log("r:", r.length);
  console.log("s:", s.length);
  console.log("v:", v);
  console.log(signature);
  console.log(signer.address)

  await lock.executeMyFunctionFromSignature(v, r, s, signer.address, 1000000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
