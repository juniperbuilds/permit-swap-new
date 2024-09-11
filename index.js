const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Permit = require('./models/Permit');
const User = require('./models/User');
const app = express();
const port = 3000;
const secret = 'your_jwt_secret'; // Store securely

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/permit-swap', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// JWT verification middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Failed to authenticate token' });
        }
        req.user = decoded; // Save the decoded token to req.user
        next();
    });
}

// User registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ _id: user._id, username: user.username }, secret, { expiresIn: '1h' });
    res.json({ token });
});

// Protected route: Add a new permit
app.post('/permits', verifyToken, async (req, res) => {
    const { location, permitType, startDate, endDate } = req.body;

    const newPermit = new Permit({
        location,
        permitType,
        startDate,
        endDate,
        user: req.user._id  // associate the permit with the logged-in user
    });

    await newPermit.save();
    res.status(201).json(newPermit);
});

// Get all permits
app.get('/permits', async (req, res) => {
    const permits = await Permit.find();
    res.json(permits);
});

// Home route to check API status
app.get('/', (req, res) => {
    res.send('Permit Swap API is running');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

