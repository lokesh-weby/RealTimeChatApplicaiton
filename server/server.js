const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config({ override: true });

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true,
  },
});

const JWT_SECRET = process.env.JWT_SECRET;

// In-memory data stores
const users = {};         // { socket.id: { uid, username, room } }
const roomUsers = {};     // { room: [ { uid, username } ] }
const roomMessages = {};  // { room: [messages] }

console.log(process.env.CLIENT_URL);

// ✅ HTTP route to login and get JWT
app.post('/login', (req, res) => {
  const { uid, username } = req.body;

  if (!uid || !username) {
    return res.status(400).json({ error: 'UID and username are required' });
  }

  const token = jwt.sign({ uid, username }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({ token });
});

// ✅ Socket.IO middleware to verify token
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query.token;

  if (!token) return next(new Error("Authentication error: No token provided"));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Attach decoded data to socket
    next();
  } catch (err) {
    return next(new Error("Authentication error: Invalid token"));
  }
});

// ✅ Socket.IO connection handler
io.on('connection', (socket) => {
  const { uid, username } = socket.user;

  socket.on('joinRoom', ({ room }) => {
    if (!room) return;

    socket.join(room);
    users[socket.id] = { uid, username, room };

    if (!roomUsers[room]) roomUsers[room] = [];
    if (!roomUsers[room].find(user => user.uid === uid)) {
      roomUsers[room].push({ uid, username });
    }

    if (!roomMessages[room]) roomMessages[room] = [];

    const joinMsg = {
      sender: 'Server',
      text: `${username} joined the room`,
      createdAt: new Date()
    };

    roomMessages[room].push(joinMsg);
    socket.to(room).emit('receiveMessage', joinMsg);
    io.to(room).emit('activeUsers', roomUsers[room]);
  });

  socket.on('sendMessage', ({ room, text }) => {
    const user = users[socket.id];
    if (!user) return;

    const message = {
      sender: user.username,
      uid: user.uid,
      room,
      text,
      createdAt: new Date()
    };

    roomMessages[room].push(message);
    io.to(room).emit('receiveMessage', message);
    socket.emit('previousMessages', roomMessages[room] || []);
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (!user) return;

    const { uid, username, room } = user;

    delete users[socket.id];

    if (roomUsers[room]) {
      roomUsers[room] = roomUsers[room].filter(u => u.uid !== uid);
      io.to(room).emit('activeUsers', roomUsers[room]);

      const leaveMsg = {
        sender: 'Server',
        text: `${username} left the room`,
        createdAt: new Date()
      };

      roomMessages[room].push(leaveMsg);
      socket.to(room).emit('receiveMessage', leaveMsg);
    }
  });
});

// Health check
app.get('/', (req, res) => {
  res.send("Socket.IO Chat Server with JWT Auth (POST login)");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
