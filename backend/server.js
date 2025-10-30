const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const errorHandler = require('./middleware/error');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');

dotenv.config();

const app = express();

const startServer = async () => {
  try {
    await connectDB();
    
    app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/auth', authRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/payments', paymentsRoutes);

    app.get('/api/health', (req, res) => {
      res.status(200).json({ status: 'OK', message: 'Server is running' });
    });

    app.use(errorHandler);

    app.use((req, res) => {
      res.status(404).json({ success: false, message: 'Route not found' });
    });

    const PORT = process.env.PORT || 4000;
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server due to DB connection error:', err);
    process.exit(1);
  }
};

startServer();