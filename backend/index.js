const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const server = require('http').createServer(app);


app.use(express.json());
app.use(cors({
    credentials: true,
    origin: `http://${process.env.SERVER_IP}:8081`,
}));
app.use(express.urlencoded({
    extended: false
}));

// session
const flash = require('express-flash');
const expressSession = require('express-session');
const fileupload = require("express-fileupload");
const secret = process.env.SESSION_SECRET || '1234';

app.use(flash());
app.use(expressSession({
    secret: secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
}));
app.use(fileupload());

const port = process.env.PORT || 8080;
server.listen(port, () => console.log(`API server listening at http://${process.env.SERVER_IP}:${port}`));


// authentication - Passpoert.js
const passport = require('./passport');
const routes = require('./routes');

app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

// websockets - socket.io
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
});


io.on('connection', socket => { 
    console.log('Nawiązałem połączenie ' + socket.id);
    
    socket.on('vote', vote => {
        socket.broadcast.emit('vote', vote);
        console.log(vote);
    });

    socket.on('join', room => {
        socket.join(room);
    });

    socket.on('updateVotes', room => {
        socket.broadcast.to(room).emit('updateVotes');
    });

    socket.on('updateComments', room => {
        socket.broadcast.to(room).emit('updateComments');
    });

    socket.on('updatePost', () => {
        socket.emit('updatePost');
        socket.broadcast.emit('updatePost');
    });
});
