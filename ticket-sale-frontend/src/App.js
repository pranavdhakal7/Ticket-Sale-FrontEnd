import React, { useState, useEffect } from "react";
import Web3 from "web3";
import "./App.css";

const App = () => {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [message, setMessage] = useState("");
  const [remainingTickets, setRemainingTickets] = useState(null);
  const [purchaseTicketNumber, setPurchaseTicketNumber] = useState("");
  const [swapTicketNumber, setSwapTicketNumber] = useState("");
  const [acceptSwapInput, setAcceptSwapInput] = useState("");
  const [getTicketAddress, setGetTicketAddress] = useState("");
  const [returnTicketId, setReturnTicketId] = useState(""); // New state for ticket ID in return function
  const [transactions, setTransactions] = useState([]);

  const web3 = new Web3(
    window.ethereum ||
      new Web3.providers.HttpProvider(
        "https://sepolia.infura.io/v3/322a7a93e1f54c85908e650366bc8aac"
      )
  );
  const contractAddress = "0xdA646dbC11F4b8A4e972bCC90758cBEd607707bd";
  const contractABI =  [{"inputs":[{"internalType":"uint256","name":"numTickets","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketId","type":"uint256"}],"name":"TicketPurchased","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"seller","type":"address"},{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"}],"name":"TicketResold","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketId","type":"uint256"}],"name":"TicketReturned","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer1","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketId1","type":"uint256"},{"indexed":true,"internalType":"address","name":"buyer2","type":"address"},{"indexed":false,"internalType":"uint256","name":"ticketId2","type":"uint256"}],"name":"TicketsSwapped","type":"event"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"acceptResale","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"ticketId","type":"uint256"}],"name":"acceptSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"ticketId","type":"uint256"}],"name":"buyTicket","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"checkResale","outputs":[{"components":[{"internalType":"uint256","name":"ticketId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"}],"internalType":"struct TicketSale.ResaleOffer[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"person","type":"address"}],"name":"getTicketOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"ticketId","type":"uint256"}],"name":"offerSwap","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"name":"resaleTicket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"resaleTickets","outputs":[{"internalType":"uint256","name":"ticketId","type":"uint256"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address","name":"seller","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"returnTicket","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"swapOffers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"ticketOwners","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ticketPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ticketsSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTickets","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setMessage(`Connected account: ${accounts[0]}`);
    } else {
      setAccount(null);
      setMessage("Please connect to MetaMask.");
    }
  };

  const connectContract = async () => {
    try {
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
      setMessage(`Connected with account: ${accounts[0]}`);
      const instance = new web3.eth.Contract(contractABI, contractAddress);
      setContract(instance);
    } catch (error) {
      setMessage(`Error connecting to MetaMask: ${error.message}`);
    }
  };

  const fetchRemainingTickets = async () => {
    try {
      if (!contract) {
        setMessage("Connect to the contract first.");
        return;
      }
      const totalTickets = await contract.methods.totalTickets().call();
      const ticketsSold = await contract.methods.ticketsSold().call();
      const availableTickets = totalTickets - ticketsSold;
      setRemainingTickets(availableTickets);
      setMessage(`Remaining Tickets: ${availableTickets}`);
    } catch (error) {
      setMessage(`Error fetching remaining tickets: ${error.message}`);
    }
  };

  const purchaseTicket = async () => {
    try {
      if (!contract || !account) {
        setMessage("Connect to MetaMask and the contract first.");
        return;
      }

      if (!purchaseTicketNumber) {
        setMessage("Please enter a valid ticket number.");
        return;
      }

      const ticketPrice = await contract.methods.ticketPrice().call();
      const tx = await contract.methods.buyTicket(purchaseTicketNumber).send({
        from: account,
        value: ticketPrice,
      });

      setMessage("Ticket purchased successfully!");
      setTransactions((prev) => [
        ...prev,
        {
          type: "Purchase",
          ticketId: purchaseTicketNumber,
          status: "Success",
          transactionHash: tx.transactionHash,
        },
      ]);
      fetchRemainingTickets();
    } catch (error) {
      setMessage(`Error purchasing ticket: ${error.message}`);
    }
  };

  const offerSwap = async () => {
    try {
      if (!contract || !account) {
        setMessage("Connect to MetaMask and the contract first.");
        return;
      }

      await contract.methods.offerSwap(swapTicketNumber).send({ from: account });
      setMessage(`Swap offer for ticket ${swapTicketNumber} has been made.`);
    } catch (error) {
      setMessage(`Error offering swap: ${error.message}`);
    }
  };

  const acceptSwap = async () => {
    try {
      if (!contract || !account) {
        setMessage("Connect to MetaMask and the contract first.");
        return;
      }

      await contract.methods.acceptSwap(acceptSwapInput).send({ from: account });
      setMessage("Swap accepted successfully.");
    } catch (error) {
      setMessage(`Error accepting swap: ${error.message}`);
    }
  };

  const getTicketNumber = async () => {
    try {
      if (!contract) {
        setMessage("Connect to the contract first.");
        return;
      }
  
      if (!web3.utils.isAddress(getTicketAddress)) {
        setMessage("Please enter a valid Ethereum address.");
        return;
      }
  
      const ticketId = await contract.methods.getTicketOf(getTicketAddress).call();
      setMessage(`Ticket ID for address ${getTicketAddress}: ${ticketId}`);
    } catch (error) {
      setMessage(`Error fetching ticket number: ${error.message}`);
    }
  };
  

  const returnTicket = async () => {
    try {
      if (!contract || !account) {
        setMessage("Connect to MetaMask and the contract first.");
        return;
      }

      if (!returnTicketId) {
        setMessage("Please enter the ticket ID to return.");
        return;
      }

      const tx = await contract.methods.returnTicket(returnTicketId).send({
        from: account,
      });
      setMessage(`Ticket ${returnTicketId} returned successfully.`);
      setTransactions((prev) => [
        ...prev,
        {
          type: "Return",
          ticketId: returnTicketId,
          status: "Success",
          transactionHash: tx.transactionHash,
        },
      ]);
      fetchRemainingTickets();
    } catch (error) {
      setMessage(`Error returning ticket: ${error.message}`);
    }
  };

  return (
    <div className="app-container">
      <h1 className="app-title">Ticket Sale System</h1>
      <div class="welcome-message">
    Welcome to the Ethereum Ticket Purchase System!
  </div>

  
  <div class="ticket-price-info">
    The price of each ticket is 0.01 ether.
  </div>
      <button className="connect-button" onClick={connectContract}>
        Connect to Contract
      </button>
      <p className="message">{message}</p>

      <div className="transaction-section">
        <h2>Remaining Tickets</h2>
        <button onClick={fetchRemainingTickets}>Show Remaining Tickets</button>
        {remainingTickets !== null && (
        <p>BUY BUY BUYY!!: {remainingTickets}</p>
        
        )}
      </div>

      <div className="transaction-section">
        <h2>Purchase Ticket</h2>
        <input
          type="number"
          placeholder="Enter Ticket Number"
          value={purchaseTicketNumber}
          onChange={(e) => setPurchaseTicketNumber(e.target.value)}
        />
        <button onClick={purchaseTicket}>Purchase Ticket</button>
      </div>

      <div className="transaction-section">
        <h2>Offer Swap</h2>
        <input
          type="number"
          placeholder="Enter Ticket Number to Swap"
          value={swapTicketNumber}
          onChange={(e) => setSwapTicketNumber(e.target.value)}
        />
        <button onClick={offerSwap}>Offer Swap</button>
      </div>

      <div className="transaction-section">
        <h2>Accept Offer</h2>
        <input
          type="text"
          placeholder="Enter Ticket Number or Address"
          value={acceptSwapInput}
          onChange={(e) => setAcceptSwapInput(e.target.value)}
        />
        <button onClick={acceptSwap}>Accept Swap</button>
      </div>

      <div className="transaction-section">
        <h2>Get Ticket Number</h2>
        <input
          type="text"
          placeholder="Enter Wallet Address"
          value={getTicketAddress}
          onChange={(e) => setGetTicketAddress(e.target.value)}
        />
        <button onClick={getTicketNumber}>Get Ticket Number</button>
      </div>

      <div className="transaction-section">
        <h2>Return Ticket</h2>
        <input
          type="number"
          placeholder="Enter Ticket ID to Return"
          value={returnTicketId}
          onChange={(e) => setReturnTicketId(e.target.value)}
        />
        <button onClick={returnTicket}>Return Ticket</button>
      </div>

      <div className="manager-section">
        <h2>Transaction History</h2>
        {transactions.length > 0 ? (
          transactions.map((txn, index) => (
            <div key={index} className="transaction">
              <p>
                <strong>Type:</strong> {txn.type}
              </p>
              <p>
                <strong>Status:</strong> {txn.status}
              </p>
              <p>
                <strong>Transaction Hash:</strong> {txn.transactionHash}
              </p>
            </div>
          ))
        ) : (
          <p>No transactions yet.</p>
        )}
      </div>
    </div>
  );
};

export default App;
