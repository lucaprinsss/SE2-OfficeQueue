import { db } from '../db/db-connection.js';
import { Ticket } from '../models/TicketDAO.js';

export const createTicket = async (serviceType) => {
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO tickets (service_id) VALUES (?)', [serviceType], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID)
      }
    });
  })
}

export const getTicketById = async (ticketId) => {
  return new Promise((resolve, reject) => {
    if (!ticketId) {
      return resolve(null);
    }
    db.get('SELECT * FROM tickets WHERE id = ?', [ticketId], (err, row) => {
      if (err) {
        reject(err);
      } else if(!row){
        resolve(null);
      } else {
        resolve(new Ticket(row));
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
      if (err) {
        reject(err);
      } else {
        resolve(row.length);
      }
    });
  });
}

export const getNextTicketForCounter = async (counterId) => {
  return new Promise((resolve, reject) => {
    // 1. Find all services the counter can handle
    db.all(`
      SELECT s.id, s.service_time
      FROM counter_services cs
      JOIN services s ON cs.service_id = s.id
      WHERE cs.counter_id = ?`, [counterId], async (err, rows) => {
      if (err) {
        return reject(err);
      }
      
      if (!rows || rows.length === 0) {
        return resolve(null);
      }

      try {
        // 2. For each service, count the waiting tickets
        const queuePromises = rows.map(service => {
          return new Promise((resolveQueue, rejectQueue) => {
            db.get(`
              SELECT COUNT(*) as length
              FROM tickets
              WHERE service_id = ? AND status = 'waiting' AND queue_date = CURRENT_DATE`, 
              [service.id], 
              (err, row) => {
                if (err) {
                  rejectQueue(err);
                } else {
                  resolveQueue({ 
                    serviceId: service.id, 
                    serviceTime: service.service_time, 
                    length: row ? row.length : 0 
                  });
                }
              }
            );
          });
        });

        const queues = await Promise.all(queuePromises);

        // 3. Find the longest queue among the manageable services
        const maxLength = Math.max(...queues.map(q => q.length));
        
        if (maxLength === 0) {
          return resolve(null);
        }

        const longestQueues = queues.filter(q => q.length === maxLength);

        // 4. In case of a tie, choose the service with the shortest service_time
        const selectedService = longestQueues.reduce((min, q) =>
          q.serviceTime < min.serviceTime ? q : min, longestQueues[0]
        );

        // 5. Get the first waiting ticket for the selected service
        db.get(`
          SELECT *
          FROM tickets
          WHERE service_id = ? AND status = 'waiting' AND queue_date = CURRENT_DATE
          ORDER BY issue_time ASC
          LIMIT 1`, [selectedService.serviceId], (err, row) => {
          if (err) {
            return reject(err);
          }
          
          if (!row) {
            return resolve(null);
          }
          
          resolve(new Ticket(row));
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

export const serveTicket = async (ticketCode, counterId) => {
  return new Promise((resolve, reject) => {
    // 1. Update the ticket status to 'served', assign the counter and service date
    db.run(`
      UPDATE tickets
      SET status = 'served',
          serve_time = CURRENT_TIMESTAMP,
          counter_id = ?
      WHERE id = ?
        AND status = 'waiting'`, [counterId, ticketCode], function(err){
          if(err){
            reject(err);
          } else if(this.changes > 0) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
  })
}
