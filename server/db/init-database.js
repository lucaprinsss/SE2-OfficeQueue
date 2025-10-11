import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Per ottenere __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path del database
const DB_PATH = path.join(__dirname, 'database.db');

// Crea il database (o lo apre se esiste)
const db = new Database(DB_PATH);

// Abilita le foreign keys
db.pragma('foreign_keys = ON');

// Funzione per inizializzare il database
function initializeDatabase() {
  console.log('Initializing database...');

  // Crea tabella services
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      service_time INTEGER DEFAULT 5
    )
  `);

  // Crea tabella counters
  db.exec(`
    CREATE TABLE IF NOT EXISTS counters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // Crea tabella counter_services
  db.exec(`
    CREATE TABLE IF NOT EXISTS counter_services (
      counter_id INTEGER,
      service_id INTEGER,
      PRIMARY KEY (counter_id, service_id),
      FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // Crea tabella tickets
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      counter_id INTEGER,
      status TEXT DEFAULT 'waiting',
      queue_date DATE DEFAULT (DATE('now')),
      issue_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      serve_time TIMESTAMP,
      end_time TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (counter_id) REFERENCES counters(id)
    )
  `);

  console.log('Database tables created successfully');

  // Verifica se ci sono già dati
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  
  if (serviceCount.count === 0) {
    console.log('Inserting initial data...');
    
    // Inserisci servizi iniziali
    const insertService = db.prepare('INSERT INTO services (name, service_time) VALUES (?, ?)');
    insertService.run('Shipping', 5);
    insertService.run('Accounting', 10);
    insertService.run('Registry', 15);

    // Inserisci sportelli iniziali
    const insertCounter = db.prepare('INSERT INTO counters (name) VALUES (?)');
    insertCounter.run('Counter 1');
    insertCounter.run('Counter 2');
    insertCounter.run('Counter 3');

    // Associa servizi agli sportelli
    const insertCounterService = db.prepare(
      'INSERT INTO counter_services (counter_id, service_id) VALUES (?, ?)'
    );
    // Counter 1: Shipping e Accounting
    insertCounterService.run(1, 1);
    insertCounterService.run(1, 2);
    // Counter 2: Accounting e Registry
    insertCounterService.run(2, 2);
    insertCounterService.run(2, 3);
    // Counter 3: Shipping e Registry
    insertCounterService.run(3, 1);
    insertCounterService.run(3, 3);

    console.log('Initial data inserted successfully');
  } else {
    console.log('Database already contains data, skipping initialization');
  }

  console.log('Database ready!');
}

// Inizializza il database al primo import
initializeDatabase();

// Esporta l'istanza del database
export default db;