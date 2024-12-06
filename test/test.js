const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

// Configure ganache with multiple accounts and sufficient balance
const provider = ganache.provider({
  accounts: [
    { balance: '1000000000000000000000' },  // Account 0 (deployer)
    { balance: '1000000000000000000000' },  // Account 1 (buyer)
    { balance: '1000000000000000000000' },  // Account 2 (another buyer)
    { balance: '1000000000000000000000' }   // Account 3 (extra account)
  ],
  gasLimit: 8000000
});

const web3 = new Web3(provider);
const { interface, bytecode } = require('../scripts/compile');

let accounts;
let ticketSale;
const TICKET_PRICE = web3.utils.toWei('0.1', 'ether');

beforeEach(async () => {
  // Get accounts
  accounts = await web3.eth.getAccounts();
  
  console.log('Deploying contract with account:', accounts[0]);
  console.log('Account balance:', await web3.eth.getBalance(accounts[0]));
  
  try {
    // Deploy contract
    ticketSale = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({
        data: bytecode,
        arguments: [10, TICKET_PRICE]
      })
      .send({
        from: accounts[0],
        gas: '6000000'
      });
      
    console.log('Contract deployed to:', ticketSale.options.address);
  } catch (error) {
    console.error('Deployment error details:', error);
    throw error;
  }
});

describe('TicketSale Contract', () => {
  it('deploys a contract', () => {
    assert.ok(ticketSale.options.address);
  });

  it('allows one account to buy a ticket', async () => {
    try {
      const initialBalance = await web3.eth.getBalance(accounts[1]);
      console.log('Buyer initial balance:', initialBalance);

      await ticketSale.methods.buyTicket(1).send({
        from: accounts[1],
        value: TICKET_PRICE,
        gas: '3000000'
      });

      const ticketOwner = await ticketSale.methods.ticketOwners(1).call();
      assert.equal(ticketOwner, accounts[1]);
    } catch (error) {
      console.error('Buy ticket error:', error);
      throw error;
    }
  });

  it('prevents buying same ticket twice', async () => {
    await ticketSale.methods.buyTicket(1).send({
      from: accounts[1],
      value: TICKET_PRICE,
      gas: '3000000'
    });

    try {
      await ticketSale.methods.buyTicket(1).send({
        from: accounts[2],
        value: TICKET_PRICE,
        gas: '3000000'
      });
      assert(false, 'Should not allow buying same ticket twice');
    } catch (err) {
      assert(err);
    }
  });

  it('allows ticket swap between two users', async () => {
    // First user buys ticket 1
    await ticketSale.methods.buyTicket(1).send({
      from: accounts[1],
      value: TICKET_PRICE,
      gas: '3000000'
    });

    // Second user buys ticket 2
    await ticketSale.methods.buyTicket(2).send({
      from: accounts[2],
      value: TICKET_PRICE,
      gas: '3000000'
    });

    // First user offers swap
    await ticketSale.methods.offerSwap(1).send({
      from: accounts[1],
      gas: '3000000'
    });

    // Second user accepts swap
    await ticketSale.methods.acceptSwap(1).send({
      from: accounts[2],
      gas: '3000000'
    });

    const ticket1Owner = await ticketSale.methods.ticketOwners(1).call();
    const ticket2Owner = await ticketSale.methods.ticketOwners(2).call();

    assert.equal(ticket1Owner, accounts[2]);
    assert.equal(ticket2Owner, accounts[1]);
  });

  it('allows resale of tickets', async () => {
    // First user buys ticket
    await ticketSale.methods.buyTicket(1).send({
      from: accounts[1],
      value: TICKET_PRICE,
      gas: '3000000'
    });

    // User offers ticket for resale
    const resalePrice = web3.utils.toWei('0.15', 'ether');
    await ticketSale.methods.resaleTicket(resalePrice).send({
      from: accounts[1],
      gas: '3000000'
    });

    // Another user buys the resale ticket
    await ticketSale.methods.acceptResale(0).send({
      from: accounts[2],
      value: resalePrice,
      gas: '3000000'
    });

    const newOwner = await ticketSale.methods.ticketOwners(1).call();
    assert.equal(newOwner, accounts[2]);
  });
});