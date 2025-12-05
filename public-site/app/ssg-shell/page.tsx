export const dynamic = 'force-static'
import ClientHome from './client-home'

export default function Page() {
  return (
    <main className="min-h-screen py-12 px-4">
      <h1 className="text-2xl font-semibold mb-4">SSG Shell — Client-side fetch example</h1>
      <ClientHome />
    </main>
  )
}
