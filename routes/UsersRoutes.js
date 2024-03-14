import express from 'express';
import { createUsers, deleteUsers, getUsers, getUsersById, updateUsers } from '../controllers/UsersControllers.js';
const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', getUsersById);
router.post('/users', createUsers);
router.patch('/users/:id', updateUsers);
router.delete('/users/:id', deleteUsers);

export default router;
