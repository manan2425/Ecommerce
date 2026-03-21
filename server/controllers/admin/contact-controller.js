import Contact from "../../models/Contact.js";
import { getIO } from "../../helpers/socket.js";

// Get all contacts with pagination and filters
export const getAllContacts = async (req, res) => {
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

        // Search by name, email, subject, or company
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { subject: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

        const [contacts, total] = await Promise.all([
            Contact.find(query)
                .populate("repliedBy", "userName email")
                .sort(sortOptions)
                .skip(skip)
                .limit(parseInt(limit)),
            Contact.countDocuments(query)
        ]);

        // Get stats
        const stats = await Contact.aggregate([
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
            data: contacts,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalContacts: total,
                hasMore: skip + contacts.length < total
            },
            stats: statsMap
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contacts"
        });
    }
};

// Get single contact by ID
export const getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id)
            .populate("repliedBy", "userName email");

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        // Mark as read if it's new
        if (contact.status === "new") {
            contact.status = "read";
            await contact.save();

            // Emit socket event
            const io = getIO();
            if (io) {
                io.emit("contact-updated", contact);
            }
        }

        res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        console.error("Error fetching contact:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch contact"
        });
    }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        if (status) {
            contact.status = status;
            if (status === "replied") {
                contact.repliedAt = new Date();
                contact.repliedBy = req.user?.id || null;
            }
        }

        if (adminNotes !== undefined) {
            contact.adminNotes = adminNotes;
        }

        await contact.save();

        // Emit socket event
        const io = getIO();
        if (io) {
            io.emit("contact-updated", contact);
        }

        res.status(200).json({
            success: true,
            message: "Contact updated successfully",
            data: contact
        });
    } catch (error) {
        console.error("Error updating contact:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update contact"
        });
    }
};

// Delete contact
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        // Emit socket event
        const io = getIO();
        if (io) {
            io.emit("contact-deleted", id);
        }

        res.status(200).json({
            success: true,
            message: "Contact deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting contact:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete contact"
        });
    }
};

// Bulk delete contacts
export const bulkDeleteContacts = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please provide contact IDs to delete"
            });
        }

        await Contact.deleteMany({ _id: { $in: ids } });

        // Emit socket event
        const io = getIO();
        if (io) {
            io.emit("contacts-bulk-deleted", ids);
        }

        res.status(200).json({
            success: true,
            message: `${ids.length} contacts deleted successfully`
        });
    } catch (error) {
        console.error("Error bulk deleting contacts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete contacts"
        });
    }
};
