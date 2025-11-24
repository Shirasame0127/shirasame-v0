// Minimal shim for legacy mock imports
// NOTE: This file exists only to keep the dev build from failing while
// migrating code away from local mock-data. Remove usages and delete this file
// once the codebase no longer imports from `@/lib/mock-data`.

export const mockAuthUser = {
  id: 'user-ghost',
  username: 'ghost',
  email: 'ghost@example.com',
}

export const mockUser = {
  id: 'user-ghost',
  username: 'ghost',
  displayName: 'Ghost',
  email: 'ghost@example.com',
  profileImage: '/minimalist-avatar-profile.jpg',
  headerImageUrl: '/minimalist-desk-setup-with-keyboard-and-monitor.jpg',
  backgroundColor: '#ffffff',
}

export default mockUser
