import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 text-left bg-white shadow-lg">
        <h1 className="text-2xl font-bold">Welcome to Biometric Auth App</h1>
        <p className="mt-4">This is a demo of biometric authentication with Supabase integration.</p>
        <div className="mt-4">
          <Link href="/login" className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700">
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

