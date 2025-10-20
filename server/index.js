
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, ServerStatus } = require('./db');
const app = express();
const port = 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

wss.on('connection', ws => {
  console.log('Client connected');
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

const addLog = (serverId, log) => {
  db.run('INSERT INTO logs (serverId, log) VALUES (?, ?)', [serverId, `[${new Date().toISOString()}] ${log}`]);
};

// Auth routes
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  db.run('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword], function (err) {
    if (err) {
      return res.status(500).send('User already exists.');
    }
    const token = jwt.sign({ id: this.lastID }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  });
});

app.get('/me', authenticateToken, (req, res) => {
    db.get('SELECT id, email FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err || !user) {
            return res.status(404).send('User not found.');
        }
        res.status(200).send(user);
    });
});

app.post('/login', (req, res) => {
  db.get('SELECT * FROM users WHERE email = ?', [req.body.email], (err, user) => {
    if (err || !user) {
      return res.status(404).send('User not found.');
    }
    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
    res.status(200).send({ auth: true, token });
  });
});

// Get all servers
app.get('/servers', authenticateToken, (req, res) => {
  db.all('SELECT * FROM servers WHERE userId = ?', [req.user.id], (err, rows) => {
    if (err) {
      res.status(500).send('Error fetching servers');
    } else {
      rows.forEach(row => {
        if (row.metrics) {
          row.metrics = JSON.parse(row.metrics);
        }
      });
      res.json(rows);
    }
  });
});

// Create a new server
app.post('/servers', authenticateToken, (req, res) => {
  const { name, template } = req.body;
  const newServer = {
    id: String(Date.now()),
    name,
    status: ServerStatus.CREATING,
    template,
    createdAt: new Date().toISOString(),
    functionCalls: 0,
    totalDataIn: 0,
    totalDataOut: 0,
    userId: req.user.id,
  };
  db.run(
    'INSERT INTO servers (id, name, status, template, createdAt, functionCalls, totalDataIn, totalDataOut, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      newServer.id,
      newServer.name,
      newServer.status,
      newServer.template,
      newServer.createdAt,
      newServer.functionCalls,
      newServer.totalDataIn,
      newServer.totalDataOut,
      newServer.userId,
    ],
    function (err) {
      if (err) {
        res.status(500).send('Error creating server');
      } else {
        addLog(newServer.id, 'Server creation initiated.');
        broadcast({ type: 'server_created', server: newServer });
        setTimeout(() => {
          db.run(
            "UPDATE servers SET status = ?, containerId = ?, url = ? WHERE id = ?",
            [
              ServerStatus.RUNNING,
              Math.random().toString(36).substring(2, 8),
              `https://${name}.mcp.app`,
              newServer.id,
            ],
            () => {
              addLog(newServer.id, 'Server is now running.');
              broadcast({ type: 'server_updated', serverId: newServer.id });
            }
          );
        }, 5000);
        res.status(201).json(newServer);
      }
    }
  );
});

// Start a server
app.put('/servers/:id/start', authenticateToken, (req, res) => {
    db.get('SELECT name FROM servers WHERE id = ? AND userId = ?', [req.params.id, req.user.id], (err, server) => {
        if (err || !server) {
            return res.status(404).send('Server not found.');
        }
        db.run(
            "UPDATE servers SET status = ? WHERE id = ?",
            [ServerStatus.STARTING, req.params.id],
            function (err) {
            if (err) {
                res.status(500).send('Error starting server');
            } else {
                addLog(req.params.id, 'Server starting...');
                broadcast({ type: 'server_updated', serverId: req.params.id });
                setTimeout(() => {
                db.run(
                    "UPDATE servers SET status = ?, containerId = ?, url = ? WHERE id = ?",
                    [
                    ServerStatus.RUNNING,
                    Math.random().toString(36).substring(2, 8),
                    `https://${server.name}.mcp.app`,
                    req.params.id,
                    ],
                    () => {
                        addLog(req.params.id, 'Server is now running.');
                        broadcast({ type: 'server_updated', serverId: req.params.id });
                    }
                );
                }, 5000);
                res.json({ id: req.params.id, status: ServerStatus.STARTING });
            }
            }
        );
    });
});

// Stop a server
app.put('/servers/:id/stop', authenticateToken, (req, res) => {
  db.run(
    "UPDATE servers SET status = ? WHERE id = ? AND userId = ?",
    [ServerStatus.STOPPING, req.params.id, req.user.id],
    function (err) {
      if (err) {
        res.status(500).send('Error stopping server');
      } else {
        addLog(req.params.id, 'Server stopping...');
        broadcast({ type: 'server_updated', serverId: req.params.id });
        setTimeout(() => {
          db.run(
            "UPDATE servers SET status = ?, containerId = NULL, url = NULL WHERE id = ?",
            [ServerStatus.STOPPED, req.params.id],
            () => {
                addLog(req.params.id, 'Server stopped.');
                broadcast({ type: 'server_updated', serverId: req.params.id });
            }
          );
        }, 3000);
        res.json({ id: req.params.id, status: ServerStatus.STOPPING });
      }
    }
  );
});

// Delete a server
app.delete('/servers/:id', authenticateToken, (req, res) => {
  db.run("DELETE FROM servers WHERE id = ? AND userId = ?", [req.params.id, req.user.id], function (err) {
    if (err) {
      res.status(500).send('Error deleting server');
    } else {
      db.run("DELETE FROM logs WHERE serverId = ?", [req.params.id]);
      broadcast({ type: 'server_deleted', serverId: req.params.id });
      res.status(204).send();
    }
  });
});

// Get server logs
app.get('/servers/:id/logs', authenticateToken, (req, res) => {
    db.get('SELECT id FROM servers WHERE id = ? AND userId = ?', [req.params.id, req.user.id], (err, server) => {
        if (err || !server) {
            return res.status(404).send('Server not found.');
        }
        db.all('SELECT log FROM logs WHERE serverId = ?', [req.params.id], (err, rows) => {
            if (err) {
            res.status(500).send('Error fetching logs');
            } else {
            res.json(rows.map(row => row.log));
            }
        });
    });
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
