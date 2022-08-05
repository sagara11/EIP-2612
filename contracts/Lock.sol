// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract Lock {
    uint256 public unlockTime;
    address public owner;
    mapping(address => uint256) private nonces;

    event Withdrawal(uint256 amount, uint256 when);

    constructor(uint256 _unlockTime) {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = msg.sender;
    }

    function withdraw(address _owner, uint256 _myParam) public {
        // Uncomment this line to print a log in your terminal
        console.log("The owner is %o", _owner);
        console.log("The params is %o", _myParam);

        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == _owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);
    }

    function executeMyFunctionFromSignature(
        uint8 v,
        bytes32 r,
        bytes32 s,
        address _owner,
        uint256 _myParam
    ) external {
        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Lock")),
                keccak256(bytes("1")),
                31337,
                address(this)
            )
        );

        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256("withdraw(address _owner, uint256 _myParam)"),
                _owner,
                _myParam
            )
        );

        bytes32 hashValue = keccak256(
            abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct)
        );

        address signer = ecrecover(hashValue, v, r, s);

        console.log("The owner is %o and origin owner is %o", signer, _owner);
        console.log("Time %o and %o:", block.chainid, address(this));
        require(signer == _owner, "MyFunction: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");

        withdraw(_owner, _myParam);
    }
}
