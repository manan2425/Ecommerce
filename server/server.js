import dotenv from "dotenv";
dotenv.config();

import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import controllers directly (you'll need to adapt them for plain Node.js)
import { registerUser, login, logout, forgotPassword, resetPassword, authMiddleware } from './controllers/auth/auth-controller.js';
// Import other controllers as needed...

import { setIO } from "./helpers/socket.js";

const PORT = process.env.PORT || 5001;

// Simple router object to map paths to handlers
const routes = {
  'POST /api/auth/register': registerUser,
  'POST /api/auth/login': login,
  'POST /api/auth/logout': logout,
  'POST /api/auth/forgot-password': forgotPassword,
  'POST /api/auth/reset-password': resetPassword,
  'GET /api/auth/check-auth': async (req, res) => {
    // Manually apply authMiddleware for this route in the HTTP server
    await authMiddleware(req, res, () => {
      const user = req.user;
      res.status(200).json({
        success: true,
        message: "User Authenticated",
        user
      });
    });
  },
};

// Function to parse JSON body
const parseBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
};

// CORS headers - Support both CLIENT_URL and CLIENT_BASE_URL (as suggested in deployment guide)
const getAllowedOrigin = () => {
  return process.env.CLIENT_URL || process.env.CLIENT_BASE_URL || 'http://localhost:5173';
};

const corsHeaders = {
  'Access-Control-Allow-Origin': getAllowedOrigin(),
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cache-Control, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true'
};

// Request handler
const requestHandler = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => res.setHeader(key, corsHeaders[key]));

  // Parse body for POST/PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    req.body = await parseBody(req);
  }

  // Simple routing
  const routeKey = `${req.method} ${req.url}`;
  const handler = routes[routeKey];

  if (handler) {
    // Adapt Express-like req/res for controllers
    req.params = {}; // Add params parsing if needed
    req.query = {}; // Add query parsing if needed
    res.json = (data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };
    res.cookie = (name, value, options) => {
      let cookieStr = `${name}=${value}`;
      if (options?.httpOnly) cookieStr += '; HttpOnly';
      if (options?.secure) cookieStr += '; Secure';
      if (options?.path) cookieStr += `; Path=${options.path}`;
      else cookieStr += '; Path=/';
      res.setHeader('Set-Cookie', cookieStr);
      return res;
    };
    res.clearCookie = (name) => {
      res.setHeader('Set-Cookie', `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`);
      return res;
    };
    // Call handler
    await handler(req, res);
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Backend is working 🚀');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
};

const httpServer = createServer(requestHandler);

// Export for Vercel
export default requestHandler;

// MongoDB Connection
const DataBaseConnection = async () => {
  const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerce1";

  try {
    await mongoose.connect(mongoUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const dbName = mongoose.connection?.name || mongoUrl.split('/').pop();
    console.log(`MongoDB connected successfully to '${dbName}'.`);
  } catch (error) {
    console.error("MongoDB connection error:", error?.message || error);
  }
};

DataBaseConnection();

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

setIO(io);

export { io };

// Start Server only if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    console.log(`Allowed Origin: ${getAllowedOrigin()}`);
  });
}