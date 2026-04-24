import app from './server/server.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 8080;

// Note: httpServer was used in server.js for socket.io. 
// If you use socket.io, you should import the server instance, not just the app.
// But for a standard Express deployment on Hostinger, listening to the app is fine.

app.listen(PORT, () => {
    console.log(`Server is running properly on port ${PORT}`);
});
