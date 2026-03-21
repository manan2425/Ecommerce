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

// ✅ TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend is working 🚀");
});

// ✅ FIXED CORS (IMPORTANT 🔥)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cache-Control",
    "Expires",
    "Pragma"
  ],
  credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/categories", adminCategoryRouter);
app.use("/api/admin/analytics", adminAnalyticsRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/categories", shopCategoryRouter);
app.use("/api/admin/services", adminServiceRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/contacts", adminContactRouter);
app.use("/api/admin/service-inquiries", adminServiceInquiryRouter);
app.use("/api/shop/services", shopServiceRouter);
app.use("/api/shop/contact", shopContactRouter);
app.use("/api/shop/service-inquiry", shopServiceInquiryRouter);
app.use("/api/admin/brands", adminBrandRouter);
app.use("/api/shop/brands", shopBrandRouter);

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

const PORT = process.env.PORT || 5001;

// Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*",
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

app.set('io', io);
setIO(io);

export { io };

// Start Server
httpServer.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});