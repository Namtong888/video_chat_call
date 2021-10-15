const express = require('express');
const path = require('path');
const { webRoutes, apiRoutes } = require('./routes');

const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);

// Config ViewEngine
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// parse json request body
app.use(express.json());

// Config StaticFiles
app.use("/static", express.static(path.join(__dirname, 'public')));

// Config Routing
app.use('/', webRoutes);
app.use('/api', apiRoutes);
  
// Socket service
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

module.exports = app;