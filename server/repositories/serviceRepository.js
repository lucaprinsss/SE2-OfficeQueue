import {db} from '../db/db-connection.js';
import { Service } from '../models/ServiceDAO.js';

export const getServices = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM services', (err, rows) => {
      if(err){
        reject(err);
      } else if(rows === undefined){
        resolve(undefined);
      } else{
        const services = rows.map(row => new Service(row));
        resolve(services);
      }
    });
  })
}
