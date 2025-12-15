export const tagsPaths = {
  '/api/tags': { get: { summary: 'List tags', responses: { '200': { description: 'OK' } } } },
  '/api/admin/tags': { post: { summary: 'Create tag', responses: { '200': { description: 'Created' } } }, delete: { summary: 'Delete tag(s)', responses: { '200': { description: 'OK' } } } },
  '/api/admin/tags/save': { post: { summary: 'Upsert multiple tags', responses: { '200': { description: 'OK' } } } },
  '/api/admin/tags/custom': { post: { summary: 'Create multiple tags', responses: { '200': { description: 'OK' } } } },
  '/api/admin/tags/reorder': { post: { summary: 'Reorder tags', responses: { '200': { description: 'OK' } } } }
}
export default tagsPaths
