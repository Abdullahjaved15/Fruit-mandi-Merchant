import express from 'express';
import { authAdmin, authUser, registerUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { validateRequest, schemas } from '../middlewares/validationMiddleware.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', validateRequest(schemas.register), registerUser);
router.post('/login', authUser);
router.post('/admin/login', authAdmin);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;
