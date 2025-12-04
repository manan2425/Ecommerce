import express from 'express';
import {
    addCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus
} from '../../controllers/admin/category-controller.js';

const router = express.Router();

// Public routes
router.get('/get-all', getAllCategories);
router.get('/get/:id', getCategoryById);

// Admin routes
router.post('/add', addCategory);
router.put('/update/:id', updateCategory);
router.delete('/delete/:id', deleteCategory);
router.patch('/toggle/:id', toggleCategoryStatus);

export default router;
