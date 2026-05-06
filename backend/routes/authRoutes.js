import express from 'express';
import { authAdmin, authUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/admin/login', authAdmin);

export default router;
