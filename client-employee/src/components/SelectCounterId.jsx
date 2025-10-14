import { useState } from "react";
import "../App.css";

function SelectCounterID({ setCounterID }) {
  const ids = [1, 2, 3];
  const [selectedId, setSelectedId] = useState("");

  const handleLogin = () => {
    if (!selectedId) return;
    setCounterID(Number(selectedId));
  };

  return (
    <div className="select-counter-id card">
      <h2>Select your counter ID</h2>

      <div className="select-wrapper">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          aria-label="Select counter id"
        >
          <option value="">-- Select counter --</option>
          {ids.map((id) => (
            <option key={id} value={id}>
              Counter {id}
            </option>
          ))}
        </select>
        <span className="caret" aria-hidden>
          ▾
        </span>
      </div>

      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <button
          className="login-button"
          onClick={handleLogin}
          disabled={!selectedId}
          style={{ marginTop: "12px" }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default SelectCounterID;
