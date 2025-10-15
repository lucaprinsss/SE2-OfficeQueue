import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');

// Controlla se il database esiste già
const dbExists = fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  
  if (dbExists) {
    console.log('Database already exists. Cleaning tickets table...');
    cleanTicketsTable();
  } else {
    console.log('Creating new database...');
    initializeDatabase();
  }
});

// Funzione per pulire solo la tabella tickets
function cleanTicketsTable() {
  db.serialize(() => {
    // Elimina tutti i ticket
    db.run('DELETE FROM tickets', (err) => {
      if (err) {
        console.error('Error deleting tickets:', err.message);
        process.exit(1);
      }
      console.log('✓ Tickets table cleaned');
    });

    // Reset dell'autoincrement per ripartire da 1
    db.run('DELETE FROM sqlite_sequence WHERE name="tickets"', (err) => {
      if (err) {
        console.error('Error resetting autoincrement:', err.message);
      } else {
        console.log('✓ Ticket ID counter reset to 1');
      }
      
      console.log('\n✅ Database ready! Tickets will start from ID 1');
      db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        process.exit(0);
      });
    });
  });
}

// Funzione per inizializzare il database da zero
function initializeDatabase() {
  db.serialize(() => {
    // Abilita le foreign keys
    db.run('PRAGMA foreign_keys = ON');

    // Creates services table
    db.run(`
      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        service_time INTEGER DEFAULT 5
      )
    `, (err) => {
      if (err) console.error('Error creating services table:', err.message);
      else console.log('✓ Services table created');
    });

    // Creates counters table
    db.run(`
      CREATE TABLE IF NOT EXISTS counters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      )
    `, (err) => {
      if (err) console.error('Error creating counters table:', err.message);
      else console.log('✓ Counters table created');
    });

    // Creates counter_services table
    db.run(`
      CREATE TABLE IF NOT EXISTS counter_services (
        counter_id INTEGER,
        service_id INTEGER,
        PRIMARY KEY (counter_id, service_id),
        FOREIGN KEY (counter_id) REFERENCES counters(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating counter_services table:', err.message);
      else console.log('✓ Counter_services table created');
    });

    // Creates tickets table
    db.run(`
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
    `, (err) => {
      if (err) {
        console.error('Error creating tickets table:', err.message);
        process.exit(1);
      }
      console.log('✓ Tickets table created');
      
      // Dopo aver creato tutte le tabelle, inserisci i dati iniziali
      insertInitialData();
    });
  });
}

// Funzione per inserire i dati iniziali
function insertInitialData() {
  console.log('\nInserting initial data...');

  db.serialize(() => {
    // Insert initial services
    const insertService = db.prepare('INSERT INTO services (name, service_time) VALUES (?, ?)');
    insertService.run('Shipping', 5);
    insertService.run('Accounting', 10);
    insertService.run('Registry', 15);
    insertService.finalize((err) => {
      if (err) console.error('Error inserting services:', err.message);
      else console.log('✓ Services inserted');
    });

    // Insert initial counters
    const insertCounter = db.prepare('INSERT INTO counters (name) VALUES (?)');
    insertCounter.run('Counter 1');
    insertCounter.run('Counter 2');
    insertCounter.run('Counter 3');
    insertCounter.finalize((err) => {
      if (err) console.error('Error inserting counters:', err.message);
      else console.log('✓ Counters inserted');
    });

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
    insertCounterService.finalize((err) => {
      if (err) {
        console.error('Error inserting counter_services:', err.message);
      } else {
        console.log('✓ Counter-services associations created');
      }
      
      console.log('\n✅ Database initialized successfully!');
      db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        process.exit(0);
      });
    });
  });
}