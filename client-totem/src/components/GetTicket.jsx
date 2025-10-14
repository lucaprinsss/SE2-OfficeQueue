import React, { useState } from "react";
import { getTicket } from "../api/ticketApi";
import "../App.css";

function GetTicket() {
  const [selectedService, setSelectedService] = useState("");
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const services = [
    { id: "deposit", name: "Deposit Money" },
    { id: "package", name: "Send Package" },
    { id: "account", name: "Open Account" },
  ];

  const handleGetTicket = async () => {
    if (!selectedService) {
      alert("Please select a service first!");
      return;
    }

    setLoading(true);
    setError(null);
    setTicket(null);

    try {
      const ticketData = await getTicket(selectedService);
      setTicket(ticketData);
    } catch (err) {
      setError("Failed to get ticket. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-ticket card">
      <h2>Select a Service</h2>
      
      <div className="service-buttons horizontal">
        {services.map((service) => (
          <button
            key={service.id}
            className={`service-btn ${
              selectedService === service.id ? "selected" : ""
            }`}
            onClick={() => setSelectedService(service.id)}
          >
            {service.name}
          </button>
        ))}
      </div>

      <button
        className="get-ticket-btn"
        onClick={handleGetTicket}
        disabled={loading}
      >
        {loading ? "Getting Ticket..." : "Get Ticket"}
      </button>

      {error && <p className="error">{error}</p>}

      {ticket && (
        <div className="ticket-info">
          <h3>Your Ticket</h3>
          <p>
            Number: <strong>{ticket.number || ticket.ticketNumber}</strong>
          </p>
          <p>Service: {ticket.serviceName || selectedService}</p>
          {ticket.estimatedTime && (
            <p>Estimated wait: {ticket.estimatedTime} min</p>
          )}
          <p>Please wait until your number is called.</p>
        </div>
      )}
    </div>
  );
}

export default GetTicket;
