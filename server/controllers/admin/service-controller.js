import Service from "../../models/Service.js";
import { emitEvent, SOCKET_EVENTS } from "../../helpers/socket.js";

// Add a new service
export const addService = async (req, res) => {
    try {
        const { title, description, category, image, price, priceType, estimatedDuration, features, specifications, displayOrder } = req.body;

        if (!title || !description || !category || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Title, description, category and price are required"
            });
        }

        const newService = new Service({
            title,
            description,
            category,
            image: image || '',
            price: Number(price),
            priceType: priceType || 'fixed',
            estimatedDuration: estimatedDuration || '',
            features: features || [],
            specifications: specifications || [],
            displayOrder: displayOrder || 0,
            isActive: true
        });

        await newService.save();

        // Emit socket event for real-time update
        emitEvent(SOCKET_EVENTS.SERVICE_CREATED, newService);

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            data: newService
        });
    } catch (error) {
        console.error("Error adding service:", error);
        res.status(500).json({
            success: false,
            message: "Error adding service"
        });
    }
};

// Get all services (admin)
export const fetchAllServices = async (req, res) => {
    try {
        const services = await Service.find({}).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching services"
        });
    }
};

// Get active services (shop)
export const fetchActiveServices = async (req, res) => {
    try {
        const { category } = req.query;
        const filter = { isActive: true };
        
        if (category && category !== 'all') {
            filter.category = category;
        }

        const services = await Service.find(filter).sort({ displayOrder: 1, createdAt: -1 });
        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching services"
        });
    }
};

// Get single service
export const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        console.error("Error fetching service:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching service"
        });
    }
};

// Edit service
export const editService = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, image, price, priceType, estimatedDuration, features, specifications, displayOrder, isActive } = req.body;

        const service = await Service.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Update fields
        service.title = title || service.title;
        service.description = description || service.description;
        service.category = category || service.category;
        service.image = image !== undefined ? image : service.image;
        service.price = price !== undefined ? Number(price) : service.price;
        service.priceType = priceType || service.priceType;
        service.estimatedDuration = estimatedDuration !== undefined ? estimatedDuration : service.estimatedDuration;
        service.features = features || service.features;
        service.specifications = specifications || service.specifications;
        service.displayOrder = displayOrder !== undefined ? displayOrder : service.displayOrder;
        service.isActive = isActive !== undefined ? isActive : service.isActive;

        await service.save();

        // Emit socket event for real-time update
        emitEvent(SOCKET_EVENTS.SERVICE_UPDATED, service);

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: service
        });
    } catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({
            success: false,
            message: "Error updating service"
        });
    }
};

// Delete service
export const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findByIdAndDelete(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        // Emit socket event for real-time update
        emitEvent(SOCKET_EVENTS.SERVICE_DELETED, { _id: id });

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({
            success: false,
            message: "Error deleting service"
        });
    }
};

// Toggle service active status
export const toggleServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await Service.findById(id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        service.isActive = !service.isActive;
        await service.save();

        emitEvent(SOCKET_EVENTS.SERVICE_UPDATED, service);

        res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
            data: service
        });
    } catch (error) {
        console.error("Error toggling service status:", error);
        res.status(500).json({
            success: false,
            message: "Error toggling service status"
        });
    }
};
