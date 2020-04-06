# Specialty Coffee - product life cycle

## Overview

Supply chain and blockchain are a perfect match.
This project illustrates a simplified specialty coffee supply chain, built on Ethereum.
It is part of an Udacity Blockchain Dev program assignment and should only not be used in productive environment.

## Usage

The main page displays a quick-start guide, actions for each supply chain participant, followed by a transaction history output.

![Specialty Coffee](/Project_4/assets/screenshots/main_page.png?raw=true 'Main Page')

## Stack Composition

For this project, I used the following stack:
- Solidity Smart Contracts
- Truffle and Ganache for my development and testing framework
- Lite-server for my front-end development
- MetaMask for my web3 provider

Output of `truffle version` command:
```script
Truffle v5.1.14-nodeLTS.0 (core: 5.1.13)
Solidity v0.5.16 (solc-js)
Node v13.12.0
Web3.js v1.2.1
```

## Prerequisites

1.  You will need [Metamask](https://metamask.io/) plugin for Firefox/Chrome.
2.  Make sure you have [Node.js](https://nodejs.org/en/) installed.

## Installation

1.  Install [Truffle Framework](http://truffleframework.com/) and [Ganache CLI](http://truffleframework.com/ganache/) globally.

    ```bash
    npm install -g truffle
    npm install -g ganache-cli
    ```

2.  Run the development blockchain.

    ```bash
    ganache-cli
    ```

3.  Open another terminal, clone this repo and install its dependencies.

    ```bash
    git clone https://github.com/fi-ma/blockchain_dev.git

    cd Project_4

    npm install
    ```

4.  Compile and migrate the smart contracts.

    ```bash
    truffle compile
    truffle migrate
    ```

5.  Start the application

    ```bash
    npm run dev
    ```

6.  Navigate to http://localhost:3000/ in your browser.

7.  Remember to connect [MetaMask](https://metamask.io/) to one of your local Ganache Ethereum accounts

    - Connect to Localhost 8545, or
    - Create and connect to a custom RPC network using the Ganache RPC server (currently `http://127.0.0.1:8545`), then
    - Import a new account and use the account seed phrase provided by Ganache

## Testing

To run the unit tests, open a terminal and run `truffle test`.

You should see an output similar to this one:

![Specialty Coffee](/Project_4/assets/screenshots/truffle_test.png?raw=true 'Truffle Test')

## Project Assignment Details

### Deployment on the Rinkeby test network

This project has been deployed on the Ethereum's Rinkeby test network and the contract address of the SupplyChain contract is `0x9EA836Ca7A12475365903f169910107724771EbB`.

### Transaction history per action on Rinkeby

![Specialty Coffee](/Project_4/assets/screenshots/rinkeby_transaction_hist.png?raw=true 'Rinkeby Transaction History')

### UML Activity Diagram

![Specialty Coffee](/Project_4/assets/screenshots/uml_activity_diagram.png?raw=true 'UML Activity Diagram')

### UML Sequence Diagram

![Specialty Coffee](/Project_4/assets/screenshots/uml_sequence_diagram.png?raw=true 'UML Sequence Diagram')

### UML State Diagram

![Specialty Coffee](/Project_4/assets/screenshots/uml_state_diagram.png?raw=true 'UML State Diagram')

### UML Class Diagram

![Specialty Coffee](/Project_4/assets/screenshots/uml_class_diagram.png?raw=true 'UML Class Diagram')