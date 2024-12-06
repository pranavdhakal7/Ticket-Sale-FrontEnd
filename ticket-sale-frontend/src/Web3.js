contract.once("TicketPurchased", { filter: { buyer: account }, fromBlock: "latest" }, (error, event) => {
    if (error) {
        console.error("Event listener error:", error);
    } else {
        console.log("Event data:", event);
        setMessage(`Purchase successful! Your Ticket ID is: ${event.returnValues.ticketId}`);
    }
});
