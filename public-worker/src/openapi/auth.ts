export const authPaths = {
  '/api/auth/login': { post: { tags: ['認証'], summary: 'ログイン', description: 'メール／パスワードや外部プロバイダを通じたログインを行います', requestBody: { required: true, content: { 'application/json': { schema: { type:'object', properties:{ email:{type:'string'}, password:{type:'string'} }, required:['email','password'] }, example: { email: 'user@example.com', password: 'password' } } } }, responses: { '200': { description: 'ログイン成功' }, '401': { description: '認証失敗' } } } },
  '/api/auth/logout': { post: { tags: ['認証'], summary: 'ログアウト', description: 'セッション／トークンを無効化します。', responses: { '204': { description: 'ログアウト完了' } } } }
}
export default authPaths
