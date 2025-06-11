const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);

// Setup socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: "*", // Render allows any origin for now, you can restrict later
    methods: ["GET", "POST"]
  }
});

const users = {};

// Serve static files from public/
app.use(express.static(path.join(__dirname, "public")));

// Main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Socket.io logic
io.on("connection", socket => {
  socket.on("user-joined", name => {
    users[socket.id] = name;
    socket.broadcast.emit("new-user-joined", name);
  });

  socket.on("send", data => {
    socket.broadcast.emit("receive", {
      name: users[socket.id],
      message: data.message,
      messageId: data.messageId,
    });
  });

  socket.on("delivered", messageId => {
    socket.broadcast.emit("message-delivered", messageId);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", users[socket.id]);
    delete users[socket.id];
  });
});

// Port for local or deployment
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
