import express from 'express';
import Brand from '../../models/Brand.js';

const router = express.Router();

// Get all active brands for shop
router.get('/get', async (req, res) => {
    try {
        const brands = await Brand.find({ isActive: true })
            .sort({ name: 1 })
            .select('name slug logo description country website');
        
        res.status(200).json({
            success: true,
            data: brands
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error fetching brands'
        });
    }
});

export default router;
