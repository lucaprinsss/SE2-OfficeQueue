const API_BASE_URL = "http://localhost:3001/api"; 

// POST /tickets/counters/:counterId/next-ticket 
export async function getNextCustomer(counterID) {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/counters/${counterID}/next-ticket`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data; // expected response: { servedTicket }
  } catch (error) {
    console.error("Error calling next customer:", error);
    throw error;
  }
}