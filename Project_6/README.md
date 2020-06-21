# Udacity Blockchain Capstone

The Capstone is a sample decentralized housing application project for Udacity's Blockchain course.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle) and ZoKrates Solidity verifier (to verify proof of ownership).

To install, download or clone the repo, then:

`npm install`  
`truffle compile`

## Develop

To run truffle tests:

`truffle test`  
(optionally) `truffle test --show-events`

## Deploy

In order to deploy to public network, you need to provide your mnemonic phrase and infura API key, by creating following two files in the root of this project:

`.secret` - put your mnemonic phrase here  
`.infura` - and your infura API key here

Then run:

`truffle migrate --network <network_name_from_truffle-config>`

# Project Resources

* [Remix - Solidity IDE](https://remix.ethereum.org/)
* [Visual Studio Code](https://code.visualstudio.com/)
* [Truffle Framework](https://truffleframework.com/)
* [Ganache - One Click Blockchain](https://truffleframework.com/ganache)
* [Open Zeppelin ](https://openzeppelin.org/)
* [Interactive zero knowledge 3-colorability demonstration](http://web.mit.edu/~ezyang/Public/graph/svg.html)
* [Docker](https://docs.docker.com/install/)
* [ZoKrates](https://github.com/Zokrates/ZoKrates)

# Rinkeby Deployed Solution

* ZoKrates verifier contract - 0x55eC2e5F776c17cc131b038CB8D1C3B5901280b6
* Solution square verifier contract - 0x55eC2e5F776c17cc131b038CB8D1C3B5901280b6

## OpenSea Marketplace

The Solution square verifier contract has been added to OpenSea marketplace and is accessible at [this link](https://rinkeby.opensea.io/category/real-estate-token-v10-1).

## Contract ABIs

### ZoKrates verifier contract

```json
{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": false,
        "internalType": "string",
        "name": "s",
        "type": "string"
    }
    ],
    "name": "Verified",
    "type": "event"
},
{
    "inputs": [
    {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]"
    },
    {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]"
    },
    {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]"
    },
    {
        "internalType": "uint256[2]",
        "name": "input",
        "type": "uint256[2]"
    }
    ],
    "name": "verifyTx",
    "outputs": [
    {
        "internalType": "bool",
        "name": "r",
        "type": "bool"
    }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
}
```

### Solution square verifier contract

```json
{
    "inputs": [
    {
        "internalType": "address",
        "name": "verifierContract",
        "type": "address"
    }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "Approval",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
    },
    {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
    }
    ],
    "name": "ApprovalForAll",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "oldOwner",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
    }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
    }
    ],
    "name": "Paused",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
    }
    ],
    "name": "Submitted",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "Transfer",
    "type": "event"
},
{
    "anonymous": false,
    "inputs": [
    {
        "indexed": true,
        "internalType": "address",
        "name": "by",
        "type": "address"
    }
    ],
    "name": "Unpaused",
    "type": "event"
},
{
    "inputs": [
    {
        "internalType": "bytes32",
        "name": "_myid",
        "type": "bytes32"
    },
    {
        "internalType": "string",
        "name": "_result",
        "type": "string"
    }
    ],
    "name": "__callback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "bytes32",
        "name": "_myid",
        "type": "bytes32"
    },
    {
        "internalType": "string",
        "name": "_result",
        "type": "string"
    },
    {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
    }
    ],
    "name": "__callback",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "owner",
        "type": "address"
    }
    ],
    "name": "balanceOf",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [],
    "name": "baseTokenURI",
    "outputs": [
    {
        "internalType": "string",
        "name": "",
        "type": "string"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "getApproved",
    "outputs": [
    {
        "internalType": "address",
        "name": "",
        "type": "address"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [],
    "name": "getOwner",
    "outputs": [
    {
        "internalType": "address",
        "name": "",
        "type": "address"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "owner",
        "type": "address"
    },
    {
        "internalType": "address",
        "name": "operator",
        "type": "address"
    }
    ],
    "name": "isApprovedForAll",
    "outputs": [
    {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "mint",
    "outputs": [
    {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [],
    "name": "name",
    "outputs": [
    {
        "internalType": "string",
        "name": "",
        "type": "string"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "ownerOf",
    "outputs": [
    {
        "internalType": "address",
        "name": "",
        "type": "address"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "from",
        "type": "address"
    },
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "from",
        "type": "address"
    },
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    },
    {
        "internalType": "bytes",
        "name": "_data",
        "type": "bytes"
    }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
    }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "bool",
        "name": "newPaused",
        "type": "bool"
    }
    ],
    "name": "setPaused",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "name": "solutions",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    },
    {
        "internalType": "address",
        "name": "tokenOwner",
        "type": "address"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
    }
    ],
    "name": "supportsInterface",
    "outputs": [
    {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [],
    "name": "symbol",
    "outputs": [
    {
        "internalType": "string",
        "name": "",
        "type": "string"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
    }
    ],
    "name": "tokenByIndex",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "owner",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
    }
    ],
    "name": "tokenOfOwnerByIndex",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "tokenURI",
    "outputs": [
    {
        "internalType": "string",
        "name": "",
        "type": "string"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
    {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
    }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "from",
        "type": "address"
    },
    {
        "internalType": "address",
        "name": "to",
        "type": "address"
    },
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
    }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
},
{
    "inputs": [
    {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
    },
    {
        "internalType": "address",
        "name": "tokenOwner",
        "type": "address"
    },
    {
        "internalType": "uint256[2]",
        "name": "a",
        "type": "uint256[2]"
    },
    {
        "internalType": "uint256[2][2]",
        "name": "b",
        "type": "uint256[2][2]"
    },
    {
        "internalType": "uint256[2]",
        "name": "c",
        "type": "uint256[2]"
    },
    {
        "internalType": "uint256[2]",
        "name": "input",
        "type": "uint256[2]"
    }
    ],
    "name": "mintVerified",
    "outputs": [
    {
        "internalType": "bool",
        "name": "",
        "type": "bool"
    }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
}
```