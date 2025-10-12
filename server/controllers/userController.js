import { getUserRole as getUserRoleRepo, getRoles as getRolesRepo } from '../repositories/userRepository.js';

export function getUserRole(req, res) {
  const { userId } = req.params;
  const role = getUserRoleRepo(Number(userId));
  res.json({ userId: Number(userId), role: role.role });
}

export function getRoles(req, res) {
  const roles = getRolesRepo();
  res.json(roles);
}