import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Ricrea __filename e __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');

export let db = null;

// Funzione per aprire la connessione
export const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      console.log('Database già connesso');
      return resolve(db);
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Errore durante la connessione al database:', err.message);
        reject(err);
      } else {
        resolve(db);
      }
    });
    
  });
};