const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*"
  }
});

const path = require("path");
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Socket.io logic here (same as before)
let users = {};
let sockets = {};

io.on("connection", socket => {
  socket.on("user-joined", name => {
    users[socket.id] = name;
    sockets[name] = socket.id;
    socket.broadcast.emit("new-user-joined", name);
  });

  socket.on("send", data => {
    socket.broadcast.emit("receive", {
      name: users[socket.id],
      message: data.message,
      messageId: data.messageId
    });
  });

  socket.on("delivered", messageId => {
    socket.broadcast.emit("message-delivered", messageId);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("user-left", users[socket.id]);
    delete sockets[users[socket.id]];
    delete users[socket.id];
  });
});

http.listen(process.env.PORT || 8000, () => {
  console.log("Server running on port 8000");
});
