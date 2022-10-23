// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers, web3 } = require("hardhat");
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

  // const hash = await ethers.utils.keccak256(
  //   ethers.utils.toUtf8Bytes("hello world")
  // );

  const abi = ethers.utils.defaultAbiCoder;

  const hashstructByte = await ethers.utils.keccak256(
    ethers.utils.solidityPack(["uint256", "bool"], [100000000000, true])
  );

  const encodeString = await ethers.utils.solidityPack(
    ["string", "bytes32"],
    ["\x19Ethereum Signed Message:\n32", hashstructByte]
  );

  const finalHash = await ethers.utils.keccak256(encodeString);

  // const signature_1 =
  //   "0x7ac9a96fdff615dbab27b61b508b8130a459b2d31d68fe0c01517e3f1f7f482310c88e5d82094424c04a81b2c4bc813766579001e0a3df33e0a99dcd3d2674611b";

  const { signature } = await web3.eth.accounts.sign(
    hashstructByte,
    PRIVATE_KEY
  );

  console.log(
    hashstructByte,
    finalHash,
    await simpleStorage.getEthSignedMessageHash(hashstructByte),
    signature
  );

  //   signature = signature.substring(2);
  //   const r = "0x" + signature.substring(0, 64);
  //   const s = "0x" + signature.substring(64, 128);
  //   const v = parseInt(signature.substring(128, 130), 16);

  //   console.log("r:", r);
  //   console.log("s:", s);
  //   console.log("v:", parseInt(v, 16));
  //   console.log(signature);
  //   console.log(signer.address);

  // const result = await simpleStorage.recover(finalHash, signature);
  const result = await simpleStorage.verifySig(
    "0xd3F48a6f420904829Bb82815A0d78ace694265b5",
    100000000000,
    true,
    signature
  );

  console.log(result);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
