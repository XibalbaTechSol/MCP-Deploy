
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('mcp_deploy.db');

const ServerStatus = {
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  CREATING: 'Creating',
  STARTING: 'Starting',
  STOPPING: 'Stopping',
  DELETING: 'Deleting',
};

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS servers (
      id TEXT PRIMARY KEY,
      name TEXT,
      status TEXT,
      url TEXT,
      template TEXT,
      createdAt TEXT,
      containerId TEXT,
      metrics TEXT,
      functionCalls INTEGER,
      totalDataIn REAL,
      totalDataOut REAL,
      startedAt TEXT,
      userId INTEGER
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serverId TEXT,
      log TEXT
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT
    )
  `);
});

module.exports = {
  db,
  ServerStatus,
};
