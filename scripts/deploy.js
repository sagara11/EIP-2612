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
  const [signer] = await ethers.getSigners();
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

  // const digest = TypedDataUtils.encodeDigest(typedData);

  // let signature = await signer.provider.send("eth_signTypedData_v3", [
  //   signer.address,
  //   JSON.stringify(typedData),
  // ]);

  // console.log(signature);

  let signature = await signer._signTypedData(
    msgParams.domain,
    {
      set: [
        { name: "sender", type: "address" },
        { name: "x", type: "uint" },
        { name: "deadline", type: "uint" },
      ],
    },
    msgParams.message
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

  await simpleStorage.executeSetIfSignatureMatch(
    v,
    r,
    s,
    signer.address,
    100000000000,
    100000
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
