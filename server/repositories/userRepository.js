
export function getUserRole(userId) {
  const roles = {
    1: 'customer',
    2: 'officer',
    3: 'manager',
    4: 'admin'
  };
  return roles[userId] || 'guest';
}

export function getRoles() {
  return ['customer', 'officer', 'manager', 'admin'];
}


