import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log(`Loaded environment file: ${envFile}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`MONGODB_URL: ${process.env.MONGODB_URL ? 'Set' : 'Not set'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'Set' : 'Not set'}`);

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// Configuration
import { setIO } from "./helpers/socket.js";

// Routes
import authRoutes from "./routes/auth/auth-routes.js";
import adminProductsRouter from "./routes/admin/products-routes.js";
import shopProductsRouter from "./routes/shop/product-routes.js";
import shopCartRouter from "./routes/shop/cart-routes.js";
import shopAddressRouter from "./routes/shop/address-routes.js";
import shopOrderRouter from "./routes/shop/order-routes.js";
import shopContactRouter from "./routes/shop/contact-routes.js";
import adminBrandRouter from "./routes/admin/brand-routes.js";
import adminCategoryRouter from "./routes/admin/category-routes.js";
import adminContactRouter from "./routes/admin/contact-routes.js";
import adminServiceRouter from "./routes/admin/service-routes.js";
import adminServiceInquiryRouter from "./routes/admin/service-inquiry-routes.js";
import adminAnalyticsRouter from "./routes/admin/analytics-routes.js";
import adminUserRouter from "./routes/admin/user-routes.js";
import shopBrandRouter from "./routes/shop/brand-routes.js";
import shopCategoryRouter from "./routes/shop/category-routes.js";
import shopReviewRouter from "./routes/shop/review-routes.js";
import shopServiceRouter from "./routes/shop/service-routes.js";
import shopServiceInquiryRouter from "./routes/shop/service-inquiry-routes.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5001;

// CORS Helper
const getAllowedOrigin = () => {
    return process.env.CLIENT_URL || process.env.CLIENT_BASE_URL || 'http://localhost:5173';
};

// Get allowed origins for Socket.IO (supports multiple origins)
const getAllowedOrigins = () => {
    const origins = ['http://localhost:5173', 'http://localhost:3000']; // Development origins
    const prodOrigin = process.env.CLIENT_URL || process.env.CLIENT_BASE_URL;
    if (prodOrigin) {
        origins.push(prodOrigin);
    }
    return origins;
};

// Middleware
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow mirroring of the requester's origin for better Vercel/Render compatibility
            // but fallback to the configured CLIENT_URL
            callback(null, origin || getAllowedOrigin());
        },
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "Cache-Control",
            "Expires",
            "Pragma",
            "X-Requested-With",
        ],
        credentials: true,
    })
);

app.use(cookieParser());
app.use(express.json());

// Main Request Handler Export for Vercel
export default app;

// MongoDB Connection
let isConnected = false;
async function DataBaseConnection() {
    if (isConnected) return;
    const mongoUrl = process.env.MONGODB_URL;
    console.log("Attempting to connect to MongoDB...");
    if (!mongoUrl) {
        console.error("MONGODB_URL is not set!");
        return;
    }
    console.log("MongoDB URL found, connecting...");
    try {
        await mongoose.connect(mongoUrl, {
            serverSelectionTimeoutMS: 10000,
        });
        isConnected = true;
        console.log(`MongoDB connected successfully: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("DB Connection Error:", error.message);
        console.error("Full error:", error);
    }
}

// Initiate connection but don't block at top level
DataBaseConnection();

// Middleware to ensure DB is connected before processing requests
const ensureDbConnected = async (req, res, next) => {
    try {
        if (!isConnected) {
            await DataBaseConnection();
        }
        next();
    } catch (error) {
        res.status(503).json({ success: false, message: "Database connection in progress, please try again." });
    }
};

app.use(ensureDbConnected);

// Routes
app.get("/api/ping", (req, res) => {
    res.status(200).json({ status: "pong", message: "Express backend is alive! 🚀" });
});

app.get("/api/test", (req, res) => {
    res.status(200).json({
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URL: process.env.MONGODB_URL ? "Set" : "Not set",
        JWT_SECRET: process.env.JWT_SECRET ? "Set" : "Not set",
        DB_CONNECTED: isConnected,
        PORT: process.env.PORT
    });
});

app.use("/api/auth", authRoutes);

// Admin Routes
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/brands", adminBrandRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/contacts", adminContactRouter);
app.use("/api/admin/services", adminServiceRouter);
app.use("/api/admin/service-inquiry", adminServiceInquiryRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/admin/users", adminUserRouter);

// Shop Routes
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/contact", shopContactRouter);
app.use("/api/shop/brands", shopBrandRouter);
app.use("/api/shop/categories", shopCategoryRouter);
app.use("/api/shop/reviews", shopReviewRouter);
app.use("/api/shop/services", shopServiceRouter);
app.use("/api/shop/service-inquiry", shopServiceInquiryRouter);

// MongoDB Connection
// Removed and moved up

DataBaseConnection();

// Socket.io initialization (Disabled on Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
    const io = new Server(httpServer, {
        cors: {
            origin: getAllowedOrigins(),
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);
        socket.on("disconnect", () => console.log("Client disconnected"));
    });

    setIO(io);
    
    // Start local server if not on Vercel
    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// --- PRODUCTION STATIC SERVING (For Hostinger/VPS) ---
const clientBuildPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientBuildPath));

// Catch-all route for React Router
app.get("*", (req, res) => {
    // Only serve index.html if the request doesn't start with /api
    if (!req.url.startsWith("/api")) {
        res.sendFile(path.join(clientBuildPath, "index.html"));
    }
});