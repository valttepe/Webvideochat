const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const sslkey = fs.readFileSync('ssl-key.pem');
const sslcert = fs.readFileSync('ssl-cert.pem');

const options = {
      key: sslkey,
      cert: sslcert,
};

app.use(express.static('public'));
// Use modules in public js
app.use('/modules', express.static('node_modules'));

https.createServer(options, app).listen(3000);

app.get('/', (req, res) => {
  res.send('Hello Secure World!');
});


io.on('connection', (socket) => {
    const socketid = socket.id;
    console.log('a user connected with session id '+socket.id);
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('message', (jsonMsg) => {
        console.log('received message from client: '+JSON.stringify(jsonMsg));
        io.sockets.emit('message', 'Server says: whatsupp?');
    });
    socket.on('answer', (jsonMsg) => {
        console.log('hmmm');
        socket.broadcast.emit('answer', jsonMsg);
    });
    socket.on('call', (jsonMsg) => {
        console.log('joo');
        socket.broadcast.emit('call', jsonMsg);
    });
    socket.on('candidate', (msg) => {
        console.log('candidate message recieved!');
        socket.broadcast.emit('candidate', msg);
    });
});
server.listen(3001, () => {
    console.log('Server started (3001)');
});
