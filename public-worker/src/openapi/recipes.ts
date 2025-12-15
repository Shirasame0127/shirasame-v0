export const recipesPaths = {
  '/api/recipes': { get: { summary: 'List recipes', responses: { '200': { description: 'OK' } } } },
  '/api/recipes/{id}': { get: { summary: 'Get recipe', parameters:[{ name:'id', in:'path', required:true, schema:{type:'string'} }], responses:{ '200': { description:'OK' } } } }
}
export default recipesPaths
