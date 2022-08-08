// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleStorage {
    uint256 storedData;
    struct Person {
        address addressOfuser;
        uint256 amount;
    }
    bytes32 constant PERSON_TYPEHASH =
        keccak256("Person(address addressOfuser,uint256 amount)");

    function set(uint256 x) internal {
        storedData = x;
    }

    function get() public view returns (uint256) {
        return storedData;
    }

    function hash(Person memory person) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encode(PERSON_TYPEHASH, person.addressOfuser, person.amount)
            );
    }

    function executeSetIfSignatureMatch(
        uint8 v,
        bytes32 r,
        bytes32 s,
        address sender,
        uint256 deadline,
        uint256 x
    ) external {
        require(block.timestamp < deadline, "Signed transaction expired");

        bytes32 eip712DomainHash = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("Thong")),
                keccak256(bytes("1")),
                31337,
                address(this)
            )
        );

        // bytes32 hashStruct = keccak256(
        //     abi.encode(
        //         keccak256("set(bool sender,uint x,uint deadline)"),
        //         sender,
        //         x,
        //         deadline
        //     )
        // );

        Person memory personInstance = Person(
            0x70997970C51812dc3A010C7d01b50e0d17dc79C8,
            1000
        );

        bytes32 hashStruct_2 = keccak256(
            abi.encode(
                keccak256(
                    "minhthong(Person personParams,bytes32 thing,uint x,uint deadline,bool isweb)Person(address addressOfuser,uint256 amount)"
                ),
                hash(personInstance),
                keccak256(bytes("baongoclee")),
                x,
                deadline,
                true
            )
        );

        bytes32 hash = keccak256(
            abi.encodePacked("\x19\x01", eip712DomainHash, hashStruct_2)
        );
        address signer = ecrecover(hash, v, r, s);
        require(signer == sender, "MyFunction: invalid signature");
        require(signer != address(0), "ECDSA: invalid signature");

        set(x);
    }
}
