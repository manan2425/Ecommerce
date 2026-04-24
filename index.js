import dotenv from 'dotenv';
dotenv.config();

// We just need to import the server. 
// The server.js file already handles the database connection 
// and starting the httpServer for both Express and Socket.io.
import './server/server.js';

console.log('Root index.js entry point loaded successfully');
