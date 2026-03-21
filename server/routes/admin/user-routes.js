import express from "express";
import {
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUserStats
} from "../../controllers/admin/user-controller.js";

const router = express.Router();

// Get user statistics
router.get("/stats", getUserStats);

// Get all users
router.get("/get", getAllUsers);

// Get single user
router.get("/get/:id", getUserById);

// Update user
router.put("/update/:id", updateUser);

// Toggle user status
router.patch("/toggle-status/:id", toggleUserStatus);

// Delete user
router.delete("/delete/:id", deleteUser);

export default router;
