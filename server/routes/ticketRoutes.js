import { Router } from 'express';
import { createTicket,getQueueLength} from '../controllers/ticketController.js';

const router = Router();

router.post('/', createTicket); // POST /tickets
router.get('/queue/:serviceType/length', getQueueLength); // GET /tickets/queue/:serviceType/length

export default router;