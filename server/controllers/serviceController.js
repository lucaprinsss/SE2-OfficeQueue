import { getServices as getServicesRepo } from '../repositories/serviceRepository.js';

export function getServices(req, res) {
  const services = getServicesRepo();
  res.json(services);
}

