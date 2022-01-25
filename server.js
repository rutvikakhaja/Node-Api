const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const { socketConnection } = require('./controllers/socketController');

// Handling uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!💥shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

//dotenv.config({ path: './config.env' });
dotenv.config();

const app = require('./app');
const URI =process.env.DATABASE_LOCAL;
mongoose
  .connect(URI, {
  
    useNewUrlParser: true,
    useUnifiedTopology: true,
   
  })
  .then(() => console.log('DB connected successfully!!'));

const server = http.createServer(app);
global.io = socketio(server, {
  cors: true,
  origins: ['http://localhost:4200'],
});
global.io.on('connection', socketConnection);

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDELED REJECTION!💥shutting down...');
  //console.log(err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
