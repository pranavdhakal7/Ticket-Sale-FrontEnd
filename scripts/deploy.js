require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile'); // Ensure `compile.js` is in the same directory

// Configuration from .env file
const MNEMONIC = process.env.MNEMONIC;
const INFURA_URL = process.env.INFURA_URL;

if (!MNEMONIC || !INFURA_URL) {
    throw new Error('Please set your MNEMONIC and INFURA_URL in a .env file');
}

// Set up provider and Web3 instance
const provider = new HDWalletProvider(MNEMONIC, INFURA_URL);
const web3 = new Web3(provider);

// Deployment function
const deploy = async () => {
    try {
        const accounts = await web3.eth.getAccounts();
        console.log('Deploying from account:', accounts[0]);

        const ticketPrice = web3.utils.toWei('0.01', 'ether'); // Price per ticket (adjust as needed)
        const totalTickets = 100; // Total tickets available for sale

        // Deploy the contract
        const result = await new web3.eth.Contract(JSON.parse(interface))
            .deploy({
                data: bytecode,
                arguments: [totalTickets, ticketPrice],
            })
            .send({ from: accounts[0], gas: '3000000' });

        console.log('Contract deployed at address:', result.options.address);
        console.log('ABI:', interface);

        // Save the deployed contract address for future use
        const fs = require('fs');
        const deploymentInfo = {
            address: result.options.address,
            abi: interface,
        };
        fs.writeFileSync('deployedContract.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('Deployment details saved to deployedContract.json');
    } catch (error) {
        console.error('Error deploying contract:', error);
    } finally {
        provider.engine.stop();
    }
};

deploy();
