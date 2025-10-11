import db from '../db/init-database.js';
import { Service } from '../models/ServiceDAO.js';

export function getServices() {
  const rows = db.prepare('SELECT * FROM services').all();
  return rows.map(row => new Service(row));
}
