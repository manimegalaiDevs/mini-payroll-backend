const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const db = require('./config/db'); // your Knex instance

const app = express();
app.use(express.json());
app.use(cookieParser());

// Allow frontend with cookies
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

const authRoutes = require('./routes/auth');
app.use('/api', authRoutes);
const dropdownRoutes = require('./routes/DropdownRoute');
app.use('/api/dropdown', dropdownRoutes);
const staffRoutes = require('./routes/Staff');
app.use('/api/staff', staffRoutes);
const salaryRoutes = require('./routes/StaffSalary');
app.use('/api/salary', salaryRoutes);

// DB Health Check
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
