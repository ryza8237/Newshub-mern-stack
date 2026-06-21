require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const newsRoutes = require('./routes/news');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const socialRoutes = require('./routes/social');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/newshub')
.then(() => console.log('Connected to MongoDB successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('NewsHub API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
