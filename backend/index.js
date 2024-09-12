const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Permit = require('./models/Permit');
const User = require('./models/User');
const Message = require('./models/Message');  // New Model for messages
const app = express();
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",  // Update the frontend port if necessary
    methods: ["GET", "POST"],
  }
});
const port = 3000;
const secret = 'your_jwt_secret'; // Store securely

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/permit-swap')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

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
    req.user = decoded;
    next();
  });
}

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
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

// Get messages for a specific permit
app.get('/messages/:permitId', verifyToken, async (req, res) => {
  const { permitId } = req.params;
  const messages = await Message.find({ permit: permitId });
  res.json(messages);
});

// Get messages for the logged-in user
app.get('/my-messages', verifyToken, async (req, res) => {
  const userId = req.user._id;
  const userPermits = await Permit.find({ user: userId });
  const permitIds = userPermits.map(permit => permit._id);
  const messages = await Message.find({ permit: { $in: permitIds } });
  res.json(messages);
});

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('sendMessage', async (data) => {
    const { permitId, content, token } = data;
    try {
      const decoded = jwt.verify(token, secret);
      const newMessage = new Message({
        permit: permitId,
        sender: decoded._id,
        content,
      });
      await newMessage.save();
      io.emit('receiveMessage', newMessage);  // Broadcast to all clients
    } catch (err) {
      console.error('Message sending error', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

app.get('/', (req, res) => {
  res.send('Permit Swap API is running');
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

