## **Office Queue Project**

#### Description

The Office Queue Management System efficiently organizes and controls customer queues for multi-service offices such as post offices or medical centers. It manages multiple counters, each capable of handling different service types with defined service times. Clients receive tickets for their requested services, and the system dynamically assigns them to available counters based on queue lengths and service times. Real-time updates are displayed on a main board, showing active tickets and queue statuses.<br>
Additionally, the system tracks statistics on served customers by service type and counter, providing daily, weekly, and monthly performance reports.<br>

#### Instructions:

cd server;<br>
npm install;<br>
npm run init-db;<br>
node server.js; (or npm start)<br>
<br>
cd client-employee;<br>
npm install;<br>
npm run dev;<br>
<br>
cd client-totem;<br>
npm install;<br>
npm run dev;<br>
