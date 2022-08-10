// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract SimpleStorage {
    uint256 storedData;
    struct Person {
        address addressOfuser;
        uint256 amount;
    }
    bytes32 constant PERSON_TYPEHASH =
        keccak256("Person(address addressOfuser,uint256 amount)");

    mapping(address => uint256) nonces;
    mapping(address => mapping(address => uint)) approval;

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

    function prefixed(bytes32 _hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            );
    }

    function verifySig(
        address _signer,
        string memory _message,
        bytes memory _sig
    ) external pure returns (bool) {
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recover(ethSignedMessageHash, _sig) == _signer;
    }

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sig)
        public
        pure
        returns (address)
    {
        (bytes32 r, bytes32 s, uint8 v) = _split(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _split(bytes memory _sig)
        internal
        pure
        returns (
            bytes32 r,
            bytes32 s,
            uint8 v
        )
    {
        require(_sig.length == 65, "invalid signatrue length");

        assembly {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    function getMessageHash(string memory _message)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash)
        public
        pure
        returns (bytes32)
    {
        return
            keccak256(
                (
                    abi.encodePacked(
                        "\x19Ethereum Signed Message:\n32",
                        _messageHash
                    )
                )
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

    function permit(
        address holder,
        address taker,
        uint256 nonce,
        uint256 deadline,
        bool isPermitted,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) public {
        bytes32 DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("withdrawal")),
                keccak256(bytes("1")),
                31337,
                address(this)
            )
        );

        bytes32 hashStruct = keccak256(
            abi.encode(
                keccak256(
                    "permit(address holder,address taker,uint nonce,uint deadline,bool isPermitted)"
                ),
                holder,
                taker,
                nonce,
                deadline,
                isPermitted
            )
        );
        bytes32 EIP721hash = keccak256(
            abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, hashStruct)
        );
        require(holder != address(0), "invalid holder");
        require(holder == ecrecover(EIP721hash, v, r, s), "invalid owner");
        require(deadline == 0 || deadline >= block.timestamp, "permit expired");

        nonces[holder]++;
        uint check = isPermitted ? type(uint).max : 0;
        approval[holder][taker] = check;
    }

    function getInfor(address _holder, address _taker)
        public
        view
        returns (uint256, uint)
    {
        return (nonces[_holder], approval[_holder][_taker]);
    }
}
