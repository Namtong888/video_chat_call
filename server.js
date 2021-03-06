// const express = require("express");
// const app = express();
// const server = require("http").Server(app);
// const io = require("socket.io")(server);
// const { v4: uuidV4 } = require("uuid");

const express = require('express')
const app = express()
//const cors = require('cors')
//app.use(cors())
const server = require('http').Server(app)
var ss = require('socket.io-stream')
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

// var room_id = Math.floor(Math.random() * 9999 + 1000);

// const stream = ss.createStream();



app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/create", (req, res) => {
  res.render("create");
});

app.get("/room", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});


io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });

    socket.on('screen-share', stream => {
      // console.log(stream);
      io.to(roomId).emit('screenShare', stream)
    })

    socket.on('stop-share', users => {
      io.to(roomId).emit('stop--Share', users)
    })
        
    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3000);
