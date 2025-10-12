import { 
  createTicket as createTicketRepo, 
  getQueueLength as getQueueLengthRepo,
  getNextTicketForCounter,
  serveTicket,
  getTicketById
} from '../repositories/ticketRepository.js';

export function createTicket(req, res) {
  const { serviceType } = req.body;
  if (!serviceType) return res.status(400).json({ error: 'Missing serviceType' });
  try {
    const ticket = createTicketRepo(serviceType);
    if (!ticket) return res.status(500).json({ error: 'Ticket creation failed' });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create ticket', details: error.message });
  }
}

export function getQueueLength(req, res) {
  const { serviceType } = req.params;
  try {
    const length = getQueueLengthRepo(Number(serviceType));
    res.json({ serviceType: Number(serviceType), queueLength: length });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch queue length', details: error.message });
  }
}

export function callNextTicket(req, res) {
  const counterId = parseInt(req.params.counterId);
  if (isNaN(counterId)) {
    return res.status(400).json({ error: 'Invalid counterId' });
  }
  try {
    const ticket = getNextTicketForCounter(counterId);
    if (!ticket) {
      return res.status(404).json({ error: 'No tickets to serve for this counter.' });
    }
    const served = serveTicket(ticket.id, counterId);
    if (!served) {
      return res.status(500).json({ error: 'Unable to serve ticket.' });
    }
    // Recupera il ticket aggiornato
    const updatedTicket = getTicketById(ticket.id);
    res.json({ servedTicket: updatedTicket });
  } catch (error) {
    res.status(500).json({ error: 'Error serving next ticket', details: error.message });
  }
}