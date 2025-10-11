import { Router } from 'express';
import serviceRoutes from './serviceRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.get('/', (req, res) => {
  res.send('Server Express is running!');
});

// Monta le route modulari
router.use('/services', serviceRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);

export default router;