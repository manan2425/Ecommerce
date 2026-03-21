import Brand from "../../models/Brand.js";
import { emitEvent, SOCKET_EVENTS } from "../../helpers/socket.js";

// Add new brand
export const addBrand = async (req, res) => {
    try {
        const { name, description, logo, website, country } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: "Brand name is required",
                success: false
            });
        }

        // Check if brand already exists
        const existingBrand = await Brand.findOne({ 
            name: { $regex: `^${name}$`, $options: 'i' } 
        });

        if (existingBrand) {
            return res.status(400).json({
                message: "Brand already exists",
                success: false
            });
        }

        const newBrand = new Brand({
            name: name.trim(),
            description: description || '',
            logo: logo || '',
            website: website || '',
            country: country || ''
        });

        const savedBrand = await newBrand.save();

        // Emit real-time event for brand creation
        if (typeof emitEvent === 'function') {
            emitEvent('brand:created', { brand: savedBrand });
            emitEvent('brand:refresh', { action: 'created', brandId: savedBrand._id });
        }

        return res.status(201).json({
            message: "Brand created successfully",
            success: true,
            data: savedBrand
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error creating brand",
            success: false,
            error: error.message
        });
    }
};

// Get all brands (admin gets all, including inactive)
export const getAllBrands = async (req, res) => {
    try {
        // Admin can see all brands including inactive ones
        const brands = await Brand.find({}).sort({ name: 1 });

        return res.status(200).json({
            message: "Brands retrieved successfully",
            success: true,
            data: brands
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving brands",
            success: false,
            error: error.message
        });
    }
};

// Get single brand
export const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Brand retrieved successfully",
            success: true,
            data: brand
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving brand",
            success: false,
            error: error.message
        });
    }
};

// Update brand
export const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, logo, website, country, isActive } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Brand ID is required",
                success: false
            });
        }

        const brand = await Brand.findById(id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found",
                success: false
            });
        }

        // Check if new name conflicts with existing brand
        if (name && name !== brand.name) {
            const existingBrand = await Brand.findOne({ 
                name: { $regex: `^${name}$`, $options: 'i' },
                _id: { $ne: id }
            });

            if (existingBrand) {
                return res.status(400).json({
                    message: "A brand with this name already exists",
                    success: false
                });
            }
        }

        // Update fields
        if (name) brand.name = name.trim();
        if (description !== undefined) brand.description = description;
        if (logo !== undefined) brand.logo = logo;
        if (website !== undefined) brand.website = website;
        if (country !== undefined) brand.country = country;
        if (isActive !== undefined) brand.isActive = isActive;

        const updatedBrand = await brand.save();

        // Emit real-time event for brand update
        if (typeof emitEvent === 'function') {
            emitEvent('brand:updated', { brand: updatedBrand });
            emitEvent('brand:refresh', { action: 'updated', brandId: updatedBrand._id });
        }

        return res.status(200).json({
            message: "Brand updated successfully",
            success: true,
            data: updatedBrand
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating brand",
            success: false,
            error: error.message
        });
    }
};

// Delete brand
export const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedBrand = await Brand.findByIdAndDelete(id);

        if (!deletedBrand) {
            return res.status(404).json({
                message: "Brand not found",
                success: false
            });
        }

        // Emit real-time event for brand deletion
        if (typeof emitEvent === 'function') {
            emitEvent('brand:deleted', { brandId: id });
            emitEvent('brand:refresh', { action: 'deleted', brandId: id });
        }

        return res.status(200).json({
            message: "Brand deleted successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error deleting brand",
            success: false,
            error: error.message
        });
    }
};

// Toggle brand status (active/inactive)
export const toggleBrandStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const brand = await Brand.findById(id);

        if (!brand) {
            return res.status(404).json({
                message: "Brand not found",
                success: false
            });
        }

        brand.isActive = !brand.isActive;
        const updatedBrand = await brand.save();

        // Emit real-time event
        if (typeof emitEvent === 'function') {
            emitEvent('brand:refresh', { action: 'toggled', brandId: id });
        }

        return res.status(200).json({
            message: `Brand ${updatedBrand.isActive ? 'activated' : 'deactivated'} successfully`,
            success: true,
            data: updatedBrand
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error toggling brand status",
            success: false,
            error: error.message
        });
    }
};

// Seed initial industrial brands
export const seedBrands = async (req, res) => {
    try {
        // Check if brands already exist
        const existingCount = await Brand.countDocuments();
        if (existingCount > 0) {
            return res.status(400).json({
                message: `Brands already exist (${existingCount} found). Delete them first to re-seed.`,
                success: false
            });
        }

        const industrialBrands = [
            { name: "Siemens", country: "Germany", description: "Industrial automation and digitalization" },
            { name: "ABB", country: "Switzerland", description: "Electrification and automation technology" },
            { name: "Schneider Electric", country: "France", description: "Energy management and automation" },
            { name: "Honeywell", country: "USA", description: "Industrial automation and control systems" },
            { name: "Rockwell Automation", country: "USA", description: "Industrial automation and information" },
            { name: "Emerson", country: "USA", description: "Automation solutions and commercial technology" },
            { name: "Yokogawa", country: "Japan", description: "Industrial automation and test equipment" },
            { name: "Endress+Hauser", country: "Switzerland", description: "Process automation instrumentation" },
            { name: "WIKA", country: "Germany", description: "Pressure, temperature and level measurement" },
            { name: "Pepperl+Fuchs", country: "Germany", description: "Industrial sensors and explosion protection" },
            { name: "Turck", country: "Germany", description: "Industrial automation sensors and systems" },
            { name: "Omron", country: "Japan", description: "Automation components and systems" },
            { name: "Mitsubishi Electric", country: "Japan", description: "Factory automation and mechatronics" },
            { name: "Delta Electronics", country: "Taiwan", description: "Power and thermal management solutions" },
            { name: "Bosch Rexroth", country: "Germany", description: "Drive and control technologies" },
            { name: "L&T Electrical & Automation", country: "India", description: "Electrical and automation solutions" },
            { name: "Phoenix Contact", country: "Germany", description: "Electrical connection and automation" },
            { name: "Weidmüller", country: "Germany", description: "Industrial connectivity solutions" },
            { name: "TE Connectivity", country: "Switzerland", description: "Sensors and connectivity solutions" },
            { name: "Masibus", country: "India", description: "Process control instrumentation" },
            { name: "Keyence", country: "Japan", description: "Sensors, measuring and vision systems" },
            { name: "Banner Engineering", country: "USA", description: "Sensors, vision and industrial wireless" },
            { name: "SICK", country: "Germany", description: "Sensor intelligence for industrial applications" },
            { name: "Fuji Electric", country: "Japan", description: "Power electronics and industrial systems" },
            { name: "Panasonic Industrial", country: "Japan", description: "Industrial automation devices" },
            { name: "Eaton", country: "Ireland", description: "Power management and electrical components" },
            { name: "GIC India", country: "India", description: "Timers, counters and control relays" },
            { name: "HARTING", country: "Germany", description: "Industrial connectivity solutions" },
            { name: "WAGO", country: "Germany", description: "Electrical interconnection and automation" },
            { name: "Murrelektronik", country: "Germany", description: "Decentralized automation technology" },
            { name: "Festo", country: "Germany", description: "Pneumatic and electric automation" },
            { name: "Parker Hannifin", country: "USA", description: "Motion and control technologies" },
            { name: "JUMO", country: "Germany", description: "Temperature and process measurement" },
            { name: "Multispan", country: "India", description: "Process control instruments" },
            { name: "Autonics", country: "South Korea", description: "Sensors, controllers and motion devices" },
            { name: "Danfoss", country: "Denmark", description: "Drives and heating/cooling solutions" },
            { name: "Lenze", country: "Germany", description: "Motion centric automation" },
            { name: "SEW-EURODRIVE", country: "Germany", description: "Drive technology and automation" },
            { name: "ifm electronic", country: "Germany", description: "Sensors and control systems" },
            { name: "Beckhoff", country: "Germany", description: "PC-based automation technology" }
        ];

        const createdBrands = await Brand.insertMany(industrialBrands);

        return res.status(201).json({
            message: `Successfully seeded ${createdBrands.length} industrial brands`,
            success: true,
            data: createdBrands
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error seeding brands",
            success: false,
            error: error.message
        });
    }
};
