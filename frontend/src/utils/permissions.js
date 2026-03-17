// src/utils/permissions.js

export function hasModule(user, module) {
  if (!user) return false;

  return user.role?.modules?.[module] === true;
}