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
  console.log(EIP_191_PREFIX);
  const [signer, client1] = await ethers.getSigners();
  const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();
  console.log("SimpleStorage with 1 ETH deployed to:", simpleStorage.address);

  // Generate a random private key

  const msgParams = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      person: [
        { name: "addressOfuser", type: "address" },
        { name: "amount", type: "uint" },
      ],
      set: [
        { name: "sender", type: "address" },
        { name: "x", type: "uint" },
        { name: "deadline", type: "uint" },
      ],
    },
    //make sure to replace verifyingContract with address of deployed contract
    primaryType: "set",
    domain: {
      name: "SetTest",
      version: "1",
      chainId: 31337,
      verifyingContract: simpleStorage.address,
    },
    message: {
      sender: signer.address,
      x: 100000,
      deadline: 100000000000,
    },
  };

  let signature = await signer._signTypedData(
    {
      name: "withdrawal",
      version: "1",
      chainId: 31337,
      verifyingContract: simpleStorage.address,
    },
    {
      permit: [
        { name: "holder", type: "address" },
        { name: "taker", type: "address" },
        { name: "nonce", type: "uint" },
        { name: "deadline", type: "uint" },
        { name: "isPermitted", type: "bool" },
      ],
    },
    {
      holder: signer.address,
      taker: client1.address,
      nonce: 0,
      deadline: 100000000000000,
      isPermitted: true,
    }
  );

  console.log("signature", signature);

  signature = signature.substring(2);
  const r = "0x" + signature.substring(0, 64);
  const s = "0x" + signature.substring(64, 128);
  const v = parseInt(signature.substring(128, 130), 16);

  console.log("r:", r);
  console.log("s:", s);
  console.log("v:", v);
  console.log(signature.length);
  console.log(signer.address);

  const holder = signer.address;
  const taker = client1.address;
  const nonce = 0;
  const deadline = 100000000000000;
  const isPermitted = true;

  await simpleStorage.permit(
    holder,
    taker,
    nonce,
    deadline,
    isPermitted,
    v,
    r,
    s
  );

  const nonceTest = await simpleStorage.getInfor(holder, taker);

  console.log(await simpleStorage.getInfor(holder, taker));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
