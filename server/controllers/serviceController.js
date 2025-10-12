import { getServices as getServicesRepo } from '../repositories/serviceRepository.js';

export function getServices(req, res) {
  try {
    const services = getServicesRepo();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch services', details: error.message });
  }
}

