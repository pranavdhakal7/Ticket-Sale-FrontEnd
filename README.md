Here is the updated README file for your project with the additional information:

---

# Ethereum Ticket Sale System

## Description

This application allows users to interact with a smart contract to purchase, swap, resell, and return tickets. The smart contract is deployed on the Sepolia testnet, and the app provides functionality to manage tickets in a decentralized manner, leveraging Ethereum's blockchain and smart contract functionality.

---

## Features

- **Connect to MetaMask**: Allows the user to connect their Ethereum wallet to interact with the smart contract.
- **Purchase Tickets**: Buy a ticket by paying the specified ticket price.
- **Offer Ticket Swap**: Offer a ticket for swapping with another user's ticket.
- **Accept Ticket Swap**: Accept a swap offer made by another user.
- **Resell Tickets**: List tickets for resale at a specified price.
- **Return Tickets**: Return a ticket and receive a refund for the ticket price.
- **Transaction History**: Displays a history of all transactions, including purchases, swaps, resales, and returns.
  
---

## Smart Contract Details

**Network:** Sepolia Testnet  
**Contract Address:** `0xdA646dbC11F4b8A4e972bCC90758cBEd607707bd`  
**Solidity Version:** 0.8.28  

### Core Functions

- `buyTicket(uint ticketId)` – Buy a ticket with the specified ticket ID.
- `offerSwap(uint ticketId)` – Offer a ticket for swap.
- `acceptSwap(uint ticketId)` – Accept a ticket swap offer.
- `resaleTicket(uint price)` – Resell a ticket at a specified price.
- `acceptResale(uint index)` – Accept a resale offer for a ticket.
- `returnTicket()` – Return a ticket and get a refund.

---

## Getting Started

### Prerequisites

1. Install [MetaMask](https://metamask.io/) for managing your Ethereum wallet.
2. Set up a project environment.

### Installation

1. Clone the repository:

    ```bash
https://github.com/pranavdhakal7/Ticket-Sale-FrontEnd.git

cd ticket-sale-system 
         ---------cd ticket-sale-frontend
          ---------npm start 

2. Install dependencies:

    ```bash
    npm install
    ```

### Configure Environment

1. Create a `.env` file in the root of your project with the following content:

    ```env
    MNEMONIC=your_mnemonic_phrase
    INFURA_URL=your_infura_url
    ```

    Replace `your_mnemonic_phrase` with your wallet's mnemonic phrase and `your_infura_url` with your Infura URL for connecting to the Ethereum network.

### Development Tools

- **Solidity**: For writing smart contracts.
- **Web3.js**: For interacting with the Ethereum blockchain in JavaScript.
- **Ganache CLI**: For local blockchain development (optional).
- **Mocha**: For running tests.
- **Truffle HDWallet Provider**: For deploying contracts with an Ethereum wallet.

---

## Deployment

1. **Compile Contract**:

    To compile the smart contract, run:

    ```bash
    npm run compile
    ```

2. **Generate ABI and Bytecode**:

    Generate the ABI and bytecode by running:

    ```bash
    npm run generate
    ```

3. **Run Tests**:

    To run the contract tests:

    ```bash
    npm test
    ```

4. **Deploy Contract**:

    Deploy the contract to the Sepolia testnet:

    ```bash
    npm run deploy
    ```

    You should see the following output on successful deployment:

    ```bash
    Contract compiled successfully!
    MNEMONIC exists: true
    INFURA_URL exists: true
    Attempting to deploy from account 0x85D2Ed1b1D27E272EE05Fde256932D07990eB8B4
    Contract deployed to 0xdA646dbC11F4b8A4e972bCC90758cBEd607707bd
    ```

---

## Author

**Pranav Dhakal**

---

## Notes

- This contract is deployed on the Sepolia testnet for testing purposes.
- For production use, additional security audits and optimizations are recommended.
