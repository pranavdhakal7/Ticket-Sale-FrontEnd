// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract TicketSale {
    address public owner;
    uint public ticketPrice;
    uint public totalTickets;
    uint public ticketsSold;

    mapping (uint => address) public ticketOwners;
    mapping (uint => address) public swapOffers;

    struct ResaleOffer {
        uint ticketId;
        uint price;
        address seller;
    }
    ResaleOffer[] public resaleTickets;

    event TicketPurchased(address indexed buyer, uint ticketId);
    event TicketsSwapped(address indexed buyer1, uint ticketId1, address indexed buyer2, uint ticketId2);
    event TicketResold(address indexed seller, address indexed buyer, uint ticketId, uint price);
    event TicketReturned(address indexed owner, uint ticketId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor(uint numTickets, uint price) {
        owner = msg.sender;
        totalTickets = numTickets;
        ticketPrice = price;
    }

    function buyTicket(uint ticketId) external payable {
        require(ticketId > 0 && ticketId <= totalTickets, "Invalid ticket ID.");
        require(ticketOwners[ticketId] == address(0), "Ticket already sold.");
        require(msg.value == ticketPrice, "Incorrect payment amount.");
        require(getTicketOf(msg.sender) == 0, "You can only buy one ticket.");

        ticketOwners[ticketId] = msg.sender;
        ticketsSold++;
        emit TicketPurchased(msg.sender, ticketId);
    }

    function getTicketOf(address person) public view returns (uint) {
        for (uint i = 1; i <= totalTickets; i++) {
            if (ticketOwners[i] == person) return i;
        }
        return 0;
    }

    function offerSwap(uint ticketId) external {
        require(ticketOwners[ticketId] == msg.sender, "You don't own this ticket.");
        swapOffers[ticketId] = msg.sender;
    }

    function acceptSwap(uint ticketId) external {
        uint acceptorTicket = getTicketOf(msg.sender);
        require(acceptorTicket > 0, "You need to own a ticket to swap.");
        require(swapOffers[ticketId] != address(0), "No swap offer for this ticket.");
        require(swapOffers[ticketId] != msg.sender, "Cannot accept your own swap offer.");

        address offerer = swapOffers[ticketId];
        ticketOwners[ticketId] = msg.sender;
        ticketOwners[acceptorTicket] = offerer;

        delete swapOffers[ticketId];

        emit TicketsSwapped(offerer, ticketId, msg.sender, acceptorTicket);
    }

    function resaleTicket(uint price) external {
        uint ticketId = getTicketOf(msg.sender);
        require(ticketId > 0, "You don't own a ticket to resell.");

        resaleTickets.push(ResaleOffer(ticketId, price, msg.sender));
    }

    function acceptResale(uint index) external payable {
        require(index < resaleTickets.length, "Invalid resale ticket index.");
        ResaleOffer memory offer = resaleTickets[index];
        require(offer.price == msg.value, "Incorrect payment amount.");
        require(getTicketOf(msg.sender) == 0, "You can only buy one ticket.");

        uint serviceFee = offer.price / 10; 
        uint sellerPayment = offer.price - serviceFee;

        ticketOwners[offer.ticketId] = msg.sender;

        payable(offer.seller).transfer(sellerPayment);
        payable(owner).transfer(serviceFee);

        resaleTickets[index] = resaleTickets[resaleTickets.length - 1];
        resaleTickets.pop();

        emit TicketResold(offer.seller, msg.sender, offer.ticketId, offer.price);
    }

    function checkResale() external view returns (ResaleOffer[] memory) {
        return resaleTickets;
    }

    function returnTicket() external {
        uint ticketId = getTicketOf(msg.sender);
        require(ticketId > 0, "You don't own a ticket to return.");

        // Clear ownership
        ticketOwners[ticketId] = address(0);
        ticketsSold--;

        // Refund ticket price to the ticket owner
        payable(msg.sender).transfer(ticketPrice);

        emit TicketReturned(msg.sender, ticketId);
    }
}
