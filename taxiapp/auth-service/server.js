require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// MongoDB Connection
mongoose.connect(`mongodb://${process.env.MONGO_AUTH_SERVICE_HOST}:27017/auth`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Auth Service DB Connected'))
.catch(err => console.log(err));

// User Model
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));

// Routes
app.post('/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));