const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = [];

io.on("connection", (socket) => {

  socket.on("join", ({ username, room }) => {

    socket.username = username;
    socket.room = room;

    socket.join(room);

    users.push({
      id: socket.id,
      username,
      room
    });

    const roomUsers = users.filter(u => u.room === room);

    io.to(room).emit("user list", roomUsers);

  });


  socket.on("chat message", (data) => {

    io.to(data.room).emit("chat message", {
      username: data.username,
      message: data.message
    });

  });


 socket.on("chat image", (data) => {
  io.to(data.room).emit("chat image", data);
});


  socket.on("typing", (data) => {

    socket.to(data.room).emit("typing", {
      username: data.username
    });

  });


  socket.on("disconnect", () => {

    users = users.filter(u => u.id !== socket.id);

    if(socket.room){

      const roomUsers = users.filter(u => u.room === socket.room);

      io.to(socket.room).emit("user list", roomUsers);

    }

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running...");
});
