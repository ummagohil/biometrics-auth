import { requireAuth } from '@/lib/auth'

export default async function Dashboard() {
  await requireAuth()

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p className="mt-4">This is a protected page. You can only see this if you're authenticated.</p>
      </div>
    </div>
  )
}

