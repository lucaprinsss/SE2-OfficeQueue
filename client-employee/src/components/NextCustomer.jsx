import { useState } from "react";
import { getNextCustomer } from "../api/employeeApi";
import "../App.css";

function NextCustomer({ counterID }) {
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNextCustomer = async () => {
    if (!counterID) {
      setError("Please select your counter ID before calling customers.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getNextCustomer(counterID);
      // L'API ritorna { servedTicket: { id, service_id, ... } }
      setCurrentCustomer(data.servedTicket);
      setError(null); // Pulisci eventuali errori precedenti
    } catch (err) {
      // Gestisci il messaggio di errore specifico dal server
      if (err.message.includes('No tickets to serve')) {
        setError("No customers waiting in your queue. The queue is empty.");
      } else {
        setError("Failed to call the next customer. Please try again.");
      }
      setCurrentCustomer(null); // Pulisci il customer corrente in caso di errore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="next-customer card">
      <h2>Next customer</h2>

      {counterID ? <p className="counter-id">Counter ID: {counterID}</p> : <p className="counter-id muted">No counter selected</p>}

      <div className="ticket-info">
        {currentCustomer ? (
          <p className="ticket-number">
            <strong>{currentCustomer.id}</strong>
          </p>
        ) : (
          <p className="no-customer">Call a customer</p>
        )}
      </div>

      <button
        className="next-customer-btn"
        onClick={handleNextCustomer}
        disabled={!counterID || loading}
      >
        {loading ? "Calling a customer..." : "Call next customer"}
      </button>

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default NextCustomer;