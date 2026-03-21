import User from "../../models/User.js";
import { emitEvent, SOCKET_EVENTS } from "../../helpers/socket.js";

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const { role, isActive, search } = req.query;
        
        let filter = {};
        
        if (role && role !== 'all') {
            filter.role = role;
        }
        
        if (isActive !== undefined && isActive !== 'all') {
            filter.isActive = isActive === 'true';
        }
        
        if (search) {
            filter.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching users"
        });
    }
};

// Get single user
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user"
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { userName, email, phone, role, isActive } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }

        user.userName = userName || user.userName;
        user.email = email || user.email;
        user.phone = phone !== undefined ? phone : user.phone;
        user.role = role || user.role;
        user.isActive = isActive !== undefined ? isActive : user.isActive;

        await user.save();

        const updatedUser = await User.findById(id).select('-password');

        // Emit socket event
        emitEvent(SOCKET_EVENTS.USER_UPDATED, updatedUser);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            success: false,
            message: "Error updating user"
        });
    }
};

// Toggle user status (active/inactive)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = !user.isActive;
        await user.save();

        const updatedUser = await User.findById(id).select('-password');

        // Emit socket event
        emitEvent(SOCKET_EVENTS.USER_UPDATED, updatedUser);

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: updatedUser
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({
            success: false,
            message: "Error toggling user status"
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Prevent deleting admin users
        if (user.role === 'admin') {
            return res.status(400).json({
                success: false,
                message: "Cannot delete admin users"
            });
        }

        await User.findByIdAndDelete(id);

        // Emit socket event
        emitEvent(SOCKET_EVENTS.USER_DELETED, { _id: id });

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting user"
        });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const inactiveUsers = await User.countDocuments({ isActive: false });
        const adminUsers = await User.countDocuments({ role: 'admin' });
        const regularUsers = await User.countDocuments({ role: 'user' });

        // Users registered in last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const newUsers = await User.countDocuments({ 
            createdAt: { $gte: thirtyDaysAgo } 
        });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                inactiveUsers,
                adminUsers,
                regularUsers,
                newUsers
            }
        });
    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching user statistics"
        });
    }
};
