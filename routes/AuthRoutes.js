import express from 'express';
import { CheckLogin, Login, Logout, RefreshToken } from '../controllers/AuthControllers.js';

const router = express.Router();

router.post('/login', Login);
router.get('/me', CheckLogin);
router.get('/token', RefreshToken);
router.delete('/logout', Logout);

export default router;
