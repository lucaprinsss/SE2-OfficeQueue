import db from '../db/init-database.js';
import { Ticket } from '../models/TicketDAO.js';

export function createTicket(serviceType) {
  const insert = db.prepare('INSERT INTO tickets (service_id) VALUES (?)');
  const info = insert.run(serviceType);
  const ticketId = info.lastInsertRowid;
  return ticketId;
}
export function getQueueLength(serviceType) {
  const statement = db.prepare(`
    SELECT COUNT(*) AS length
    FROM tickets
    WHERE service_id = ?
      AND status = 'waiting'
      AND queue_date = CURRENT_DATE
  `);
  const result = statement.get(serviceType);
  return result.length;
}