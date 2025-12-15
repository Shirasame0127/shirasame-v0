export const settingsPaths = {
  '/api/site-settings': { get: { summary: 'Get site settings', responses: { '200': { description: 'OK' } } }, put: { summary: 'Update site settings', responses: { '200': { description: 'OK' } } } },
  '/api/profile': { get: { summary: 'Get current user profile', responses: { '200': { description: 'OK' } } }, put: { summary: 'Update profile', responses: { '200': { description: 'OK' } } } }
}
export default settingsPaths
