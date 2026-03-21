import dotenv from "dotenv";
dotenv.config();


import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRouter from "./routes/auth/auth-routes.js";
import adminProductsRouter from "./routes/admin/products-routes.js"
import adminCategoryRouter from "./routes/admin/category-routes.js";
import adminAnalyticsRouter from "./routes/admin/analytics-routes.js";
import shopProductsRouter from "./routes/shop/product-routes.js";
import shopCartRouter from "./routes/shop/cart-routes.js";
import shopAddressRouter from "./routes/shop/address-routes.js"; 
import shopOrderRouter from "./routes/shop/order-routes.js"; 
import shopReviewRouter from "./routes/shop/review-routes.js";
import shopCategoryRouter from "./routes/shop/category-routes.js";
import adminServiceRouter from "./routes/admin/service-routes.js";
import adminUserRouter from "./routes/admin/user-routes.js";
import adminContactRouter from "./routes/admin/contact-routes.js";
import adminBrandRouter from "./routes/admin/brand-routes.js";
import adminServiceInquiryRouter from "./routes/admin/service-inquiry-routes.js";
import shopServiceRouter from "./routes/shop/service-routes.js";
import shopContactRouter from "./routes/shop/contact-routes.js";
import shopBrandRouter from "./routes/shop/brand-routes.js";
import shopServiceInquiryRouter from "./routes/shop/service-inquiry-routes.js";
import { setIO } from "./helpers/socket.js";

const app = express();
const httpServer = createServer(app);

// CORS configuration
// CORS configuration
// Allow explicit client origin if provided, otherwise allow localhost dev ports.
app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (e.g., curl, Postman)
            if (!origin) return callback(null, true);

            const allowedClient = process.env.CLIENT_BASE_URL;
            if (allowedClient && origin === allowedClient) return callback(null, true);

            // allow any localhost:PORT during development (helps when Vite picks 5173/5174/5175)
            try {
                const url = new URL(origin);
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (e) {
                // ignore parsing errors and deny by default
            }

            // otherwise block
            callback(new Error('Not allowed by CORS'));
        },
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Expires",
        "Pragma"
    ],
    credentials: true
}));

// Use Cookie Parser
app.use(cookieParser());

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// For Routes 
app.use("/api/auth/",authRouter);

// For  Admin Products Handling
app.use("/api/admin/products",adminProductsRouter);

// For Admin Categories Handling
app.use("/api/admin/categories",adminCategoryRouter);

// For Admin Analytics Handling
app.use("/api/admin/analytics",adminAnalyticsRouter);

// For Getting The Products
app.use("/api/shop/products",shopProductsRouter);

// For Cart
app.use("/api/shop/cart",shopCartRouter);

// For Address Routes
app.use("/api/shop/address",shopAddressRouter);

// For Order Routes
app.use("/api/shop/order",shopOrderRouter);
app.use("/api/shop/review",shopReviewRouter);

// For Shop Categories
app.use("/api/shop/categories",shopCategoryRouter);

// For Admin Services Handling
app.use("/api/admin/services",adminServiceRouter);

// For Admin User Management
app.use("/api/admin/users", adminUserRouter);

// For Admin Contact Messages
app.use("/api/admin/contacts", adminContactRouter);

// For Admin Service Inquiries
app.use("/api/admin/service-inquiries", adminServiceInquiryRouter);

// For Shop Services
app.use("/api/shop/services",shopServiceRouter);

// For Shop Contact Form
app.use("/api/shop/contact", shopContactRouter);

// For Shop Service Inquiries
app.use("/api/shop/service-inquiry", shopServiceInquiryRouter);

// For Admin Brands Handling
app.use("/api/admin/brands", adminBrandRouter);

// For Shop Brands
app.use("/api/shop/brands", shopBrandRouter);

// Data Base Connection (optional, only if MONGODB_URL is provided)
const DataBaseConnection = async () => {
    // Prefer environment variable but fall back to a local DB named `ecommerce1`.
    // This makes local dev easy when a developer starts a local MongoDB instance.
    const mongoUrl = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/ecommerce1";

    try {
        await mongoose.connect(mongoUrl, {
            // recommended options set by mongoose — explicit for clarity
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

// Port fallback for local dev
const PORT = process.env.PORT || 5001;

// Socket.io setup
const io = new Server(httpServer, {
    cors: {
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            const allowedClient = process.env.CLIENT_BASE_URL;
            if (allowedClient && origin === allowedClient) return callback(null, true);
            try {
                const url = new URL(origin);
                if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                    return callback(null, true);
                }
            } catch (e) {}
            callback(new Error('Not allowed by CORS'));
        },
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes and controllers
app.set('io', io);
setIO(io);

// Export io for use in controllers
export { io };

// Running the Server with Socket.io
httpServer.listen(PORT, () => {
    console.log(`Server Running on http://localhost:${PORT}`);
    console.log(`WebSocket ready for real-time updates`);
});