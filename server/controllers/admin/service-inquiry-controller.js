import ServiceInquiry from "../../models/ServiceInquiry.js";
import { getIO } from "../../helpers/socket.js";

// Get all service inquiries with pagination and filters
export const getAllServiceInquiries = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const query = {};

        // Filter by status
        if (status && status !== "all") {
            query.status = status;
        }

        // Search by name, email, serviceTitle, or company
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { serviceTitle: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
                { serviceCategory: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        const [inquiries, total] = await Promise.all([
            ServiceInquiry.find(query)
                .populate("service", "title category price image")
                .populate("repliedBy", "userName email")
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            ServiceInquiry.countDocuments(query)
        ]);

        // Get stats
        const stats = await ServiceInquiry.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        const statsMap = {
            total: 0,
            new: 0,
            read: 0,
            replied: 0,
            closed: 0
        };

        stats.forEach(s => {
            statsMap[s._id] = s.count;
            statsMap.total += s.count;
        });

        res.status(200).json({
            success: true,
            data: inquiries,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalInquiries: total,
                hasMore: skip + inquiries.length < total
            },
            stats: statsMap
        });
    } catch (error) {
        console.error("Error fetching service inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch service inquiries"
        });
    }
};

// Get single service inquiry by ID
export const getServiceInquiryById = async (req, res) => {
    try {
        const { id } = req.params;

        const inquiry = await ServiceInquiry.findById(id)
            .populate("service", "title category price image priceType")
            .populate("repliedBy", "userName email");

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Service inquiry not found"
            });
        }

        // Mark as read if it's new
        if (inquiry.status === "new") {
            inquiry.status = "read";
            await inquiry.save();

            // Emit socket event
            const io = getIO();
            if (io) {
                io.emit("service-inquiry-updated", inquiry);
            }
        }

        res.status(200).json({
            success: true,
            data: inquiry
        });
    } catch (error) {
        console.error("Error fetching service inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch service inquiry"
        });
    }
};

// Update service inquiry status
export const updateServiceInquiryStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const inquiry = await ServiceInquiry.findById(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Service inquiry not found"
            });
        }

        if (status) {
            inquiry.status = status;
            if (status === "replied") {
                inquiry.repliedAt = new Date();
                inquiry.repliedBy = req.user?.id || null;
            }
        }

        if (adminNotes !== undefined) {
            inquiry.adminNotes = adminNotes;
        }

        await inquiry.save();

        await inquiry.populate([
            { path: "service", select: "title category price image" },
            { path: "repliedBy", select: "userName email" }
        ]);

        // Emit socket event
        const io = getIO();
        if (io) {
            io.emit("service-inquiry-updated", inquiry);
        }

        res.status(200).json({
            success: true,
            data: inquiry,
            message: "Service inquiry updated successfully"
        });
    } catch (error) {
        console.error("Error updating service inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update service inquiry"
        });
    }
};

// Delete service inquiry
export const deleteServiceInquiry = async (req, res) => {
    try {
        const { id } = req.params;

        const inquiry = await ServiceInquiry.findByIdAndDelete(id);

        if (!inquiry) {
            return res.status(404).json({
                success: false,
                message: "Service inquiry not found"
            });
        }

        // Emit socket event
        const io = getIO();
        if (io) {
            io.emit("service-inquiry-deleted", id);
        }

        res.status(200).json({
            success: true,
            message: "Service inquiry deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting service inquiry:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete service inquiry"
        });
    }
};

// Bulk delete service inquiries
export const bulkDeleteServiceInquiries = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide valid inquiry IDs"
            });
        }

        const result = await ServiceInquiry.deleteMany({ _id: { $in: ids } });

        // Emit socket event for each deleted inquiry
        const io = getIO();
        if (io) {
            ids.forEach(id => io.emit("service-inquiry-deleted", id));
        }

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} service inquiries deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error bulk deleting service inquiries:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete service inquiries"
        });
    }
};
