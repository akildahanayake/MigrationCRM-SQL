require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'migratehub-secret-key-2024';

app.use(cors());
app.use(express.json());

// Initialize Database
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, role, ...rest } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const query = `INSERT INTO users (id, email, password, name, role, ${Object.keys(rest).join(', ')}) 
                   VALUES (?, ?, ?, ?, ?, ${Object.keys(rest).map(() => '?').join(', ')})`;
    
    const params = [userId, email, hashedPassword, name, role, ...Object.values(rest)];
    
    db.run(query, params, function(err) {
      if (err) {
        return res.status(400).json({ message: 'Email already exists or invalid data' });
      }
      res.status(201).json({ id: userId, email, name, role });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  });
});

// Users Routes
app.get('/api/users', (req, res) => {
  db.all('SELECT id, name, email, role, applicationStatus, targetCountry, visaType, assignedAgentId FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.get('/api/agents', (req, res) => {
  db.all('SELECT * FROM users WHERE role = "AGENT"', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// Documents Routes
app.get('/api/documents/:userId', (req, res) => {
  db.all('SELECT * FROM documents WHERE userId = ?', [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/documents', (req, res) => {
  const { userId, name, type, category, url } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO documents (id, userId, name, type, category, status, url) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, name, type, category, 'UPLOADED', url], function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ id, userId, name, type, category, status: 'UPLOADED', url });
    });
});

// Meetings Routes
app.get('/api/meetings/:userId', (req, res) => {
  db.all('SELECT * FROM meetings WHERE agentId = ? OR clientId = ?', [req.params.userId, req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// Invoices Routes
app.get('/api/invoices', (req, res) => {
  db.all('SELECT * FROM invoices', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/invoices', (req, res) => {
  const { clientId, description, amount, status, method, date, agencyId } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO invoices (id, clientId, description, amount, status, method, date, agencyId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, clientId, description, amount, status, method, date, agencyId], function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ id, clientId, description, amount, status, method, date, agencyId });
    });
});

app.put('/api/invoices/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setString = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const params = [...Object.values(updates), id];
  db.run(`UPDATE invoices SET ${setString} WHERE id = ?`, params, function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ id, ...updates });
  });
});

// Settings Routes
app.get('/api/settings', (req, res) => {
  db.all('SELECT * FROM settings', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    const settings = {};
    rows.forEach(row => {
      try {
        settings[row.key] = JSON.parse(row.value);
      } catch (e) {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  });
});

app.post('/api/settings', (req, res) => {
  const settings = req.body;
  const promises = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      db.run('INSERT INTO settings (id, key, value) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?',
        [uuidv4(), key, stringValue, stringValue], (err) => {
          if (err) reject(err);
          else resolve();
        });
    });
  });
  Promise.all(promises)
    .then(() => res.json({ message: 'Settings updated' }))
    .catch(err => res.status(500).json({ message: 'Database error' }));
});

// Update User (Generic)
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setString = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const params = [...Object.values(updates), id];
  db.run(`UPDATE users SET ${setString} WHERE id = ?`, params, function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ id, ...updates });
  });
});

app.delete('/api/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'User deleted' });
  });
});

// Agencies
app.get('/api/agencies', (req, res) => {
  db.all('SELECT * FROM agencies', [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/agencies', (req, res) => {
  const { name, licenseNumber, email, phone, address, status, tier, ownerId } = req.body;
  const id = uuidv4();
  db.run('INSERT INTO agencies (id, name, licenseNumber, email, phone, address, status, tier, ownerId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, licenseNumber, email, phone, address, status, tier, ownerId], function(err) {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ id, name, licenseNumber, email, phone, address, status, tier, ownerId });
    });
});

// Delete document
app.delete('/api/documents/:id', (req, res) => {
  db.run('DELETE FROM documents WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ message: 'Document deleted' });
  });
});

// Update Meeting
app.put('/api/meetings/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const setString = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const params = [...Object.values(updates), id];
  db.run(`UPDATE meetings SET ${setString} WHERE id = ?`, params, function(err) {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json({ id, ...updates });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'SQLite', path: './server/migratehub_database.db' });
});
