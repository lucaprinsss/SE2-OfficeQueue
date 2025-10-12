import { createTicket as createTicketRepo,getQueueLength as getQueueLengthRepo} from '../repositories/ticketRepository.js';

export function createTicket(req, res) {
  const { serviceType } = req.body;
  if (!serviceType) return res.status(400).json({ error: 'Missing serviceType' });

  const ticket = createTicketRepo(serviceType);
  res.status(201).json(ticket);
}

export function getQueueLength(req, res) {
  const { serviceType } = req.params;
  const length = getQueueLengthRepo(Number(serviceType));
  res.json({ serviceType: Number(serviceType), queueLength: length });
}