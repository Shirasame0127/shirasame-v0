export const authPaths = {
  '/api/auth/login': { post: { summary: 'Login', responses: { '200': { description: 'OK' } } } },
  '/api/auth/logout': { post: { summary: 'Logout', responses: { '204': { description: 'No Content' } } } }
}
export default authPaths
