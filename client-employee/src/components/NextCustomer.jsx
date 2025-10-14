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
      const nextCustomer = await getNextCustomer(counterID);
      setCurrentCustomer(nextCustomer);
    } catch (err) {
      setError("Failed to call the next customer. Please try again.");
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
          <h3>{currentCustomer}</h3>
        ) : (
          <p className="no-customer">Call your first customer</p>
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