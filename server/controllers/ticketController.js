import { 
  createTicket as createTicketRepo, 
  getQueueLength as getQueueLengthRepo,
  getNextTicketForCounter,
  serveTicket,
  getTicketById
} from '../repositories/ticketRepository.js';

export async function createTicket(req, res) {
  const { serviceType } = req.body;
  if (!serviceType) return res.status(400).json({ error: 'Missing serviceType' });
  try {
    const ticket = await createTicketRepo(serviceType);
    if (!ticket) return res.status(500).json({ error: 'Ticket creation failed' });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Unable to create ticket', details: error.message });
  }
}

export async function getQueueLength(req, res) {
  const { serviceType } = req.params;
  try {
    const length = await getQueueLengthRepo(Number(serviceType));
    res.json({ serviceType: Number(serviceType), queueLength: length });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch queue length', details: error.message });
  }
}

export async function callNextTicket(req, res) {
  const counterId = parseInt(req.params.counterId);
  if (isNaN(counterId)) {
    return res.status(400).json({ error: 'Invalid counterId' });
  }
  try {
    const ticket = await getNextTicketForCounter(counterId);
    if (!ticket) {
      return res.status(404).json({ error: 'No tickets to serve for this counter.' });
    }
    const served = await serveTicket(ticket.id, counterId);
    if (!served) {
      return res.status(500).json({ error: 'Unable to serve ticket.' });
    }
    // Recupera il ticket aggiornato
    const updatedTicket = await getTicketById(ticket.id);
    if (!updatedTicket) {
      return res.status(404).json({ error: 'Ticket not found after serving.' });
    }
    res.json({ servedTicket: updatedTicket });
  } catch (error) {
    res.status(500).json({ error: 'Error serving next ticket', details: error.message });
  }
}