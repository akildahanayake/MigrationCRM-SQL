import postgres from 'postgres'

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

export default sql

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'migratehub_database.db');
const db = new sqlite3.Database(dbPath);

const initDb = async () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      // Users table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        whatsapp TEXT,
        gender TEXT,
        age INTEGER,
        dob TEXT,
        nationality TEXT,
        address TEXT,
        mailingAddress TEXT,
        maritalStatus TEXT,
        profilePhoto TEXT,
        targetCountry TEXT,
        visaType TEXT,
        educationLevel TEXT,
        englishScore TEXT,
        passportNumber TEXT,
        applicationStatus TEXT,
        agencyName TEXT,
        licenseNumber TEXT,
        yearsExperience INTEGER,
        countriesSupported TEXT,
        visasSupported TEXT,
        languagesSpoken TEXT,
        bio TEXT,
        assignedAgentId TEXT,
        requestedAgentId TEXT,
        agencyId TEXT,
        lastLogin TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Agencies table
      db.run(`CREATE TABLE IF NOT EXISTS agencies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        licenseNumber TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        status TEXT,
        tier TEXT,
        ownerId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Documents table
      db.run(`CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        category TEXT,
        status TEXT,
        url TEXT,
        uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Messages table
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        senderId TEXT NOT NULL,
        receiverId TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        read INTEGER DEFAULT 0
      )`);

      // Meetings table
      db.run(`CREATE TABLE IF NOT EXISTS meetings (
        id TEXT PRIMARY KEY,
        agentId TEXT NOT NULL,
        clientId TEXT NOT NULL,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        type TEXT,
        link TEXT,
        status TEXT,
        notes TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Invoices table
      db.run(`CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        clientId TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        method TEXT,
        date TEXT NOT NULL,
        agencyId TEXT
      )`);

      // Settings table
      db.run(`CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )`);

      // Seed Super Admin if not exists
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run(`INSERT OR IGNORE INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, 
        ['admin-1', 'Super Admin', 'admin', hashedPassword, 'SUPER_ADMIN']);

      console.log('Database initialized with SQLite at ' + dbPath);
      resolve();
    });
  });
};

module.exports = { db, initDb };
