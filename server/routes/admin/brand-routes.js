import express from 'express';
import {
    addBrand,
    getAllBrands,
    getBrandById,
    updateBrand,
    deleteBrand,
    toggleBrandStatus,
    seedBrands
} from '../../controllers/admin/brand-controller.js';

const router = express.Router();

// Public routes
router.get('/get-all', getAllBrands);
router.get('/get/:id', getBrandById);

// Admin routes
router.post('/add', addBrand);
router.put('/update/:id', updateBrand);
router.delete('/delete/:id', deleteBrand);
router.patch('/toggle/:id', toggleBrandStatus);

// Seed route (for initial setup)
router.post('/seed', seedBrands);

export default router;
