import express from 'express';
import disasterController from '../controllers/disasterController.js';
import authMiddleware from '../middleware/auth.js';
import {
    canCreateDisaster,
    canUpdateDisaster,
    canVerifyDisaster,
    canViewReports
} from '../middleware/authorization.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Disaster CRUD routes
router.post('/', canCreateDisaster, disasterController.createDisaster);
router.get('/', disasterController.getDisasters);
router.get('/search', disasterController.searchDisasters);
router.get('/stats', canViewReports, disasterController.getDisasterStats);
router.get('/types', disasterController.getDisasterTypes);
router.get('/by-month', canViewReports, disasterController.getDisastersByMonth);
router.get('/by-area', canViewReports, disasterController.getDisastersByArea);
router.get('/:id', disasterController.getDisasterById);
router.put('/:id', canUpdateDisaster, disasterController.updateDisaster);
router.put('/:id/status', canVerifyDisaster, disasterController.updateDisasterStatus);
router.delete('/:id', canUpdateDisaster, disasterController.deleteDisaster);

export default router;