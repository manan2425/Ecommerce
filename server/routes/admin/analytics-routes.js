import express from 'express';
import {
  getDashboardAnalytics,
  getUserActivities,
  getUserRegistrationAnalytics,
  logUserActivity
} from '../../controllers/admin/analytics-controller.js';

const router = express.Router();

// Admin routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/registrations', getUserRegistrationAnalytics);
router.get('/activities', getUserActivities);

// User activity logging (can be called from frontend)
router.post('/log-activity', logUserActivity);

export default router;
