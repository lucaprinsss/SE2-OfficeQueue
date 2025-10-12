import {db} from '../db/db-connection.js';
import { Ticket } from '../models/TicketDAO.js';

export const createTicket = async (serviceType) => {
  return new Promise((resolve, reject) => {
      db.run('INSERT INTO tickets (service_id) VALUES (?)',[serviceType], function(err){
        if(err){
          reject(err);
        } else{
          resolve(this.lastID)
        }
      });
  })
}

export const getTicketById = async (ticketId) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tickets WHERE id = ?', [ticketId], (err, row) => {
      if(err){
        reject(err);
      } else{
        const ticket = new Ticket(row);
        resolve(ticket);
      }
    });
  })

}

export const getQueueLength = async (serviceType) => {
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT COUNT(*) AS length
      FROM tickets
      WHERE service_id = ?
        AND status = 'waiting'
        AND queue_date = CURRENT_DATE`, [serviceType], (err, row) => {  
          if(err){
            reject(err);
          } else {
            resolve(row.length);
          }
    });
  });
}

export const getNextTicketForCounter = async (counterId) => {
  return new Promise((resolve, reject) => {
    // 1. Trova i servizi gestibili dal counter
    const services = db.all(`
      SELECT s.id, s.service_time
      FROM counter_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.counter_id = ?`, [counterId], (err, rows) => {
        if(err){
          reject(err);
        } else if(rows.length === 0){
          resolve(null);
        } else {
          return rows;
        }
      });
    
      const queues = services.map(service => {
        const count = db.run(`
          SELECT COUNT(*) as length
          FROM tickets
          WHERE service_id = ? AND status = 'waiting'`, [service.id], function(err){
            if(err){
              reject(err);
            } else{
              return row.length;
            }
          });
        return { serviceId: service.id, serviceTime: service.service_time, length: count };
      });

      // 3. Trova la coda più lunga tra i servizi gestibili
      const maxLength = Math.max(...queues.map(q => q.length));
      const longestQueues = queues.filter(q => q.length === maxLength && q.length > 0);

      if (longestQueues.length === 0) resolve(null);

      // 4. In caso di parità, scegli il servizio con il minor service time
      const selectedService = longestQueues.reduce((min, q) =>
        q.serviceTime < min.serviceTime ? q : min, longestQueues[0]
      );

      // 5. Prendi il primo ticket in attesa per il servizio selezionato
      db.get(`
        SELECT *
        FROM tickets
        WHERE service_id = ? AND status = 'waiting'
        ORDER BY issue_time ASC
        LIMIT 1`, [selectedService.serviceId], (err, row) => {
          if(err){
            reject(err);
          } else {
            resolve(new Ticket(row) || null); 
          }
        });
  })
}

export const serveTicket = async (ticketCode, counterId) => {
  return new Promsise((resolve, reject) => {
    // 1. Aggiorna lo stato del ticket a 'served', assegna il counter e la data di servizio
    const update = db.run(`
      UPDATE tickets
      SET status = 'served',
          serve_time = CURRENT_TIMESTAMP,
          counter_id = ?
      WHERE id = ?
        AND status = 'waiting'`, [ticketCode, counterId], function(err){
          if(err){
            reject(err);
          } else if(row.changes > 0){ù
            resolve(true);
          } else {
            resolve(false);
          }
        });
  })
}
