export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'Shirasame Public Worker API',
    version: '1.0.0',
    description: 'Minimal OpenAPI spec for admin tag endpoints'
  },
  paths: {
    '/api/admin/tags': {
      post: {
        summary: 'Create single tag',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, group: { type: ['string','null'] }, linkUrl: { type: ['string','null'] }, linkLabel: { type: ['string','null'] }, sortOrder: { type: 'integer' } }, required: ['name'] } } } },
        responses: { '200': { description: 'Created', content: { 'application/json': { schema: { type: 'object' } } } }, '400': { description: 'Bad Request' }, '401': { description: 'Unauthenticated' }, '403': { description: 'Forbidden' }, '500': { description: 'Server error' } }
      },
      get: {
        summary: 'List tags (admin)',
        parameters: [{ name: 'userId', in: 'query', schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } }
      }
    },
    '/api/admin/tags/save': {
      post: { summary: 'Upsert multiple tags', responses: { '200': { description: 'OK' } } }
    },
    '/api/admin/tags/custom': {
      post: { summary: 'Create multiple tags (no duplicates)', responses: { '200': { description: 'OK' } } }
    },
    '/api/admin/tags/reorder': {
      post: { summary: 'Reorder tags', responses: { '200': { description: 'OK' } } }
    },
    '/api/admin/tags': {
      delete: { summary: 'Delete tags', responses: { '200': { description: 'OK' } } }
    }
  },
  components: {},
}
export default openapi
