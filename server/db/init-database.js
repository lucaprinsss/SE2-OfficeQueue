import sqlite3 from 'sqlite3';
const { Database } = sqlite3;
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');

const db = new Database(DB_PATH);

db.exec('PRAGMA foreign_keys = ON');

function initializeDatabase() {
  console.log('Initializing database...');

  // Creates services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      service_time INTEGER DEFAULT 5
    )
  `);

  // Creates counters table
  db.exec(`
    CREATE TABLE IF NOT EXISTS counters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  // Creates counter_services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS counter_services (
      counter_id INTEGER,
      service_id INTEGER,
      PRIMARY KEY (counter_id, service_id),
      FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    )
  `);

  // Creates tickets table
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

  // Check if there is already data
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get();
  
  if (serviceCount.count === 0) {
    console.log('Inserting initial data...');

    // Insert initial services
    const insertService = db.prepare('INSERT INTO services (name, service_time) VALUES (?, ?)');
    insertService.run('Shipping', 5);
    insertService.run('Accounting', 10);
    insertService.run('Registry', 15);

    // Insert initial counters
    const insertCounter = db.prepare('INSERT INTO counters (name) VALUES (?)');
    insertCounter.run('Counter 1');
    insertCounter.run('Counter 2');
    insertCounter.run('Counter 3');

    // Associate services with counters
    const insertCounterService = db.prepare(
      'INSERT INTO counter_services (counter_id, service_id) VALUES (?, ?)'
    );
    // Counter 1: Shipping and Accounting
    insertCounterService.run(1, 1);
    insertCounterService.run(1, 2);
    // Counter 2: Accounting and Registry
    insertCounterService.run(2, 2);
    insertCounterService.run(2, 3);
    // Counter 3: Shipping and Registry
    insertCounterService.run(3, 1);
    insertCounterService.run(3, 3);

    console.log('Initial data inserted successfully');
  } else {
    console.log('Database already contains data, skipping initialization');
  }

  console.log('Database ready!');
}

// Initialize the database when this module is loaded
initializeDatabase();