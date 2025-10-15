import React, { useState, useEffect } from "react";
import { getTicket, getServices } from "../api/ticketApi";
import "../App.css";

function GetTicket() {
  const [selectedService, setSelectedService] = useState("");
  const [ticketId, setTicketId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Carica i servizi all'avvio del componente
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoadingServices(true);
        const servicesData = await getServices();
        setServices(servicesData);
      } catch (err) {
        console.error("Failed to load services:", err);
        setError("Failed to load services. Please refresh the page.");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleGetTicket = async () => {
    if (!selectedService) {
      alert("Please select a service first!");
      return;
    }

    setLoading(true);
    setError(null);
    setTicketId(null);
    setSelectedService("");

    try {
      const ticketData = await getTicket(selectedService);
      setTicketId(ticketData);
    } catch (err) {
      setError("Failed to get ticket. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loadingServices) {
    return (
      <div className="get-ticket card">
        <h2>Loading services...</h2>
      </div>
    );
  }

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
        disabled={loading || services.length === 0}
      >
        {loading ? "Getting Ticket..." : "Get Ticket"}
      </button>

      {error && <p className="error">{error}</p>}

      {ticketId && (
        <div className="ticket-info">
          <h3>Your Ticket</h3>
          <p className="ticket-number">
            <strong>{ticketId}</strong>
          </p>
          <p>Please wait until your number is called.</p>
        </div>
      )}
    </div>
  );
}

export default GetTicket;
