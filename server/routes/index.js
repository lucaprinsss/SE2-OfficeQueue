import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.send('Server Express is running!');
});

export default router;