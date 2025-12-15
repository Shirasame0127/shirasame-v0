export const productsPaths = {
  '/api/products': { get: { summary: 'List products', responses: { '200': { description: 'OK' } } }, post: { summary: 'Create product', responses: { '200': { description: 'OK' } } } },
  '/api/products/{id}': { get: { summary: 'Get product', parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200': { description:'OK' } } } }
}
export default productsPaths
