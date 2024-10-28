express = require('express');
http = require('http');
socketIo = require('socket.io');
low = require('lowdb');
FileSync = require('lowdb/adapters/FileSync');

app = express();
server = http.createServer(app);
io = socketIo(server);
adapter = new FileSync('db.json');
db = low(adapter);

// Initialize the database
db.defaults({ messages: [], users: [] }).write();

// Serve the HTML page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
});

io.on('connection', function(socket) {
    console.log('A user connected');

    // Handle user join
    socket.on('join', function(username) {
        db.get('users').push({ id: socket.id, name: username }).write();
        socket.broadcast.emit('user-joined', username);
    });


    socket.on('chat message', function(msg) {
        db.get('messages').push({ id: socket.id, message: msg }).write();
        io.emit('chat message', msg);
    });

    
    socket.on('disconnect', function() {
        console.log('A user disconnected');
        db.get('users').remove({ id: socket.id }).write();
    });
});

server.listen(4000, function() {
    console.log('Server is running on http://localhost:4000');
});
