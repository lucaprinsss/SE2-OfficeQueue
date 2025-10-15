// src/api/ticketApi.js

const API_BASE_URL = "http://localhost:3001"; 

// GET /services - Ottieni tutti i servizi disponibili
export async function getServices() {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data; // expected response: array of { id, name, service_time }
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
}

export async function getTicket(serviceType) {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ serviceType }), // send selected service type
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const ticketId = await response.json();
    return ticketId; // server returns just the ticket ID (number)
  } catch (error) {
    console.error("Error fetching ticket:", error);
    throw error;
  }
}
// export async function getTicket(serviceType) {
//   // simulate a fake API delay
//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   // simulate a successful response
//   return {
//     number: Math.floor(Math.random() * 100) + 1,
//     serviceName: serviceType,
//     estimatedTime: Math.floor(Math.random() * 20) + 5,
//   };
// }
