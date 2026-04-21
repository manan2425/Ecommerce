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
  'GET /api/ping': (req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'pong', timestamp: new Date().toISOString(), message: "API is reachable! 🚀" }));
  },
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
  // Dynamic CORS: Mirror the origin of the request to fix Vercel/Render cross-talk
  const origin = req.headers.origin || getAllowedOrigin();
  
  const dynamicCorsHeaders = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': origin
  };

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200, dynamicCorsHeaders);
    res.end();
    return;
  }

  // Set CORS headers
  Object.keys(dynamicCorsHeaders).forEach(key => res.setHeader(key, dynamicCorsHeaders[key]));

  // Parse body for POST/PUT
  if (req.method === 'POST' || req.method === 'PUT') {
    req.body = await parseBody(req);
  }

  // Robust routing: extract pathname and handle /api/ prefix properly
  let url = req.url || '/';
  const urlObj = new URL(url, `http://${req.headers.host || 'localhost'}`);
  let pathname = urlObj.pathname;
  
  // Ensure we match with or without leading /api if Vercel routes differently
  const routeKey = `${req.method} ${pathname}`;
  const handler = routes[routeKey];

  console.log(`Incoming request: ${routeKey}`);

  if (handler) {
    // Adapt Express-like req/res for controllers
    req.params = {}; 
    req.query = Object.fromEntries(urlObj.searchParams);
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
  } else if (pathname === '/api/test' || pathname === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', message: 'Backend is reachable! 🚀', currentOrigin: getAllowedOrigin() }));
  } else if ((pathname === '/' || pathname === '/api') && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Backend is working 🚀');
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found', requestedPath: pathname, method: req.method }));
  }
};

const httpServer = createServer(requestHandler);

// Export for Vercel
export default requestHandler;

// MongoDB Connection with improved stability for Serverless
let isConnected = false;
const DataBaseConnection = async () => {
    if (isConnected) return;
    
    const mongoUrl = process.env.MONGODB_URL;
    if (!mongoUrl) {
        console.error("MONGODB_URL is not set in environment variables!");
        return;
    }

    try {
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
        });

        isConnected = true;
        const dbName = mongoose.connection?.name || "database";
        console.log(`MongoDB connected successfully to '${dbName}'.`);
    } catch (error) {
        console.error("CRITICAL_DB_ERROR:", error?.message || error);
        // Don't throw, let the request fail gracefully later if it needs the DB
    }
};

// Initiate connection but don't block
DataBaseConnection();

// Socket.io - Only initialize in development or on real servers (not Serverless)
let io;
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  io = new Server(httpServer, {
    cors: {
      origin: getAllowedOrigin(),
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
} else {
  console.log('Socket.io disabled for Serverless production');
}

export { io };

// Start Server only if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`Server Running on port ${PORT}`);
    console.log(`Allowed Origin: ${getAllowedOrigin()}`);
  });
}