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

  const testing = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("baongoclee"));

  const domain_1 = await ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    )
  );

  const domain_2 = await ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("Thong")
  );
  const domain_3 = await ethers.utils.keccak256(ethers.utils.toUtf8Bytes("1"));

  const abi = ethers.utils.defaultAbiCoder;
  const domainByte = abi.encode(
    ["bytes32", "bytes32", "bytes32", "uint256", "address"],
    [domain_1, domain_2, domain_3, 31337, simpleStorage.address]
  );

  const domainHash = await ethers.utils.keccak256(domainByte);

  const hashStruct_1 = await ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes("minhthong(uint x,uint deadline,bool isweb)")
  );

  const hashstructByte = abi.encode(
    ["bytes32", "uint", "uint", "bool"],
    [hashStruct_1, 100000, 100000000000, true]
  );

  const hashStruct = await ethers.utils.keccak256(hashstructByte);

  const finalData = await ethers.utils.keccak256(
    ethers.utils.hexConcat([domainHash, hashStruct])
  );

  let { signature } = await web3.eth.accounts.sign(
    finalData,
    "0x7c5312f73d84e969da53987e2d7dbb969c7548ac544123b4306177e49637542c"
  );

  console.log(signature);

  signature = signature.substring(2);
  const r = "0x" + signature.substring(0, 64);
  const s = "0x" + signature.substring(64, 128);
  const v = parseInt(signature.substring(128, 130), 16);

  console.log("r:", r);
  console.log("s:", s);
  console.log("v:", v);
  console.log(signature);
  console.log(signer.address);

  await simpleStorage.thongVerify(
    v,
    r,
    s,
    "0xd3F48a6f420904829Bb82815A0d78ace694265b5",
    100000000000,
    100000
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
