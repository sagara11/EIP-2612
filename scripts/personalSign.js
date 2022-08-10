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

  const testing = ethers.utils.hexlify(ethers.utils.toUtf8Bytes("baongoclee"));

  const prehash = await ethers.utils.hashMessage(
    "\x19Ethereum Signed Message:\n32"
  );

  let params = JSON.stringify(
    {
      Person: [
        { name: "addressOfuser", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      minhthong: [
        { name: "personParams", type: "Person" },
        { name: "thing", type: "bytes32" },
        { name: "x", type: "uint" },
        { name: "deadline", type: "uint" },
        { name: "isweb", type: "bool" },
      ],
    },
    {
      personParams: {
        addressOfuser: client1.address,
        amount: 1000,
      },
      thing: ethers.utils.keccak256(testing),
      x: 100000,
      deadline: 100000000000,
      isweb: true,
    }
  );

  //   let dataHash = ethers.utils.keccak256(
  //     ethers.utils.toUtf8Bytes(JSON.stringify(params))
  //   );

  //   const dataHashBin = Buffer.from(dataHash);
  //   const finalBuf = await ethers.utils.keccak256(dataHashBin);

//   const { r, v, s, signature } = await web3.eth.accounts.sign(
//     "\x19Ethereum Signed Message:\n32" + message.length + message,
//     "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
//   );
const wallet = new ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", ethers.provider);
let signature = await signer.signMessage("hello world");
console.log(await signature);
  signature = signature.substring(2);
  const r = "0x" + signature.substring(0, 64);
  const s = "0x" + signature.substring(64, 128);
  const v = parseInt(signature.substring(128, 130), 16);

  console.log("r:", r);
  console.log("s:", s);
  console.log("v:", parseInt(v, 16));
  console.log(signature);
  console.log(signer.address);

  await simpleStorage.verifyPersonalSign(
    parseInt(v, 16),
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
