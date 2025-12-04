import Category from "../../models/Category.js";

// Add new category
export const addCategory = async (req, res) => {
    try {
        const { name, description, icon, image } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: "Category name is required",
                success: false
            });
        }

        // Check if category already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: `^${name}$`, $options: 'i' } 
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists",
                success: false
            });
        }

        const newCategory = new Category({
            name: name.trim(),
            description: description || '',
            icon: icon || '',
            image: image || ''
        });

        const savedCategory = await newCategory.save();

        return res.status(201).json({
            message: "Category created successfully",
            success: true,
            data: savedCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error creating category",
            success: false,
            error: error.message
        });
    }
};

// Get all categories (admin gets all, including inactive)
export const getAllCategories = async (req, res) => {
    try {
        // Admin can see all categories including inactive ones
        const categories = await Category.find({}).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Categories retrieved successfully",
            success: true,
            data: categories
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving categories",
            success: false,
            error: error.message
        });
    }
};

// Get single category
export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Category retrieved successfully",
            success: true,
            data: category
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error retrieving category",
            success: false,
            error: error.message
        });
    }
};

// Update category
export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, icon, image, isActive } = req.body;

        if (!id) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false
            });
        }

        // Check if new name already exists (excluding current category)
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({
                _id: { $ne: id },
                name: { $regex: `^${name}$`, $options: 'i' }
            });

            if (existingCategory) {
                return res.status(400).json({
                    message: "Another category with this name already exists",
                    success: false
                });
            }
            category.name = name.trim();
        }

        if (description !== undefined) category.description = description;
        if (icon !== undefined) category.icon = icon;
        if (image !== undefined) category.image = image;
        if (isActive !== undefined) category.isActive = isActive;

        const updatedCategory = await category.save();

        return res.status(200).json({
            message: "Category updated successfully",
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating category",
            success: false,
            error: error.message
        });
    }
};

// Delete category
export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Category ID is required",
                success: false
            });
        }

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false
            });
        }

        return res.status(200).json({
            message: "Category deleted successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error deleting category",
            success: false,
            error: error.message
        });
    }
};

// Toggle category active status
export const toggleCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                success: false
            });
        }

        category.isActive = !category.isActive;
        const updatedCategory = await category.save();

        return res.status(200).json({
            message: `Category ${updatedCategory.isActive ? 'activated' : 'deactivated'} successfully`,
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Error updating category status",
            success: false,
            error: error.message
        });
    }
};
