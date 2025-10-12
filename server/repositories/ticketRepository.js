import {db} from '../db/db-connection.js';
import { Ticket } from '../models/TicketDAO.js';

export function createTicket(serviceType) {
  const insert = db.prepare('INSERT INTO tickets (service_id) VALUES (?)');
  const info = insert.run(serviceType);
  const ticketId = info.lastInsertRowid;
  return ticketId;
}

export function getTicketById(ticketId) {
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);
  return new Ticket(ticket) || null;
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

export function getNextTicketForCounter(counterId) {
  // 1. Trova i servizi gestibili dal counter
  const services = db.prepare(`
    SELECT s.id, s.service_time
    FROM counter_services cs
    JOIN services s ON cs.service_id = s.id
    WHERE cs.counter_id = ?
  `).all(counterId);

  if (services.length === 0) return null;

  // 2. Per ogni servizio, conta i ticket in attesa
  const queues = services.map(service => {
    const count = db.prepare(`
      SELECT COUNT(*) as length
      FROM tickets
      WHERE service_id = ? AND status = 'waiting'
    `).get(service.id).length;
    return { serviceId: service.id, serviceTime: service.service_time, length: count };
  });

  // 3. Trova la coda più lunga tra i servizi gestibili
  const maxLength = Math.max(...queues.map(q => q.length));
  const longestQueues = queues.filter(q => q.length === maxLength && q.length > 0);

  if (longestQueues.length === 0) return null;

  // 4. In caso di parità, scegli il servizio con il minor service time
  const selectedService = longestQueues.reduce((min, q) =>
    q.serviceTime < min.serviceTime ? q : min, longestQueues[0]
  );

  // 5. Prendi il primo ticket in attesa per il servizio selezionato
  const ticket = db.prepare(`
    SELECT *
    FROM tickets
    WHERE service_id = ? AND status = 'waiting'
    ORDER BY issue_time ASC
    LIMIT 1
  `).get(selectedService.serviceId);

  return new Ticket(ticket) || null;
}

export function serveTicket(ticketCode, counterId) {
  // 1. Aggiorna lo stato del ticket a 'served', assegna il counter e la data di servizio
  const update = db.prepare(`
    UPDATE tickets
    SET status = 'served',
        serve_time = CURRENT_TIMESTAMP,
        counter_id = ?
    WHERE id = ?
      AND status = 'waiting'
  `);

  const info = update.run(counterId, ticketCode);
  return info.changes > 0; // true se il ticket è stato servito, false altrimenti
}
