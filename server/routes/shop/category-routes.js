import express from 'express';
import Category from '../../models/Category.js';

const router = express.Router();

// Get all active categories for shop
router.get('/get', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 })
            .select('name slug icon image description');
        
        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories'
        });
    }
});

export default router;
