const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbDir = path.join(__dirname, 'RecipeSite.db');

const db = new sqlite3.Database(dbDir, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

module.exports = db;