import { Router } from 'express';
import { getRoles } from '../controllers/userController.js';

const router = Router();

router.get('/roles', getRoles); // GET /roles

export default router;