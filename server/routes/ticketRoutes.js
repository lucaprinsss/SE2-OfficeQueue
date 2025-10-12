import { Router } from 'express';
import { createTicket, getQueueLength, callNextTicket } from '../controllers/ticketController.js';

const router = Router();

router.post('/', createTicket); // POST /tickets
router.get('/queue/:serviceType/length', getQueueLength); // GET /tickets/queue/:serviceType/length
router.post('/counters/:counterId/next-ticket', callNextTicket); // POST /tickets/counters/:counterId/next-ticket 

export default router;