export const collectionsPaths = {
  '/api/collections': { get: { summary: 'List collections', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create collection', responses: { '200': { description: 'OK' } } } },
  '/api/collections/{id}': { get: { summary: 'Get collection', parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200': { description:'OK' } } } }
}
export default collectionsPaths
