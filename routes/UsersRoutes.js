import express from 'express';
import { createUsers, deleteUsers, getUsers, getUsersById, updateUsers } from '../controllers/UsersControllers.js';
import { AdminOnly, verifyUser } from '../middleware/Auth.js';
const router = express.Router();

router.get('/users', verifyUser, AdminOnly, getUsers);
router.get('/users/:id', verifyUser, AdminOnly, getUsersById);
router.post('/users', verifyUser, AdminOnly, createUsers);
router.patch('/users/:id', verifyUser, AdminOnly, updateUsers);
router.delete('/users/:id', verifyUser, AdminOnly, deleteUsers);

export default router;
