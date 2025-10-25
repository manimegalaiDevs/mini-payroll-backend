const express = require('express');
const db = require('./db'); // your Knex instance

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('OK'));

// ✅ DB Health Check
app.get('/health', async (req, res) => {
    try {
        await db.raw('SELECT 1'); // simple query to check DB connection
        res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (err) {
        console.error('DB connection error:', err.message);
        res.status(500).json({ status: 'error', db: 'disconnected', error: err.message });
    }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://0.0.0.0:${PORT}`);
});
