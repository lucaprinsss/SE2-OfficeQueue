import { getUserRole as getUserRoleRepo, getRoles as getRolesRepo } from '../repositories/userRepository.js';

export async function getUserRole(req, res) {
  const { userId } = req.params;
  try {
    const role = await getUserRoleRepo(Number(userId));
    if (!role) return res.status(404).json({ error: 'User not found' });
    res.json({ userId: Number(userId), role: role.role });
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch user role', details: error.message });
  }
}

export async function getRoles(req, res) {
  try {
    const roles = await getRolesRepo();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch roles', details: error.message });
  }
}