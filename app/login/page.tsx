'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) {
      setError('Your browser does not support biometric authentication')
      return
    }

    try {
      // Check if the user has registered for biometric auth before
      const { data: existingCredential } = await supabase
        .from('biometric_credentials')
        .select('credential_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!existingCredential) {
        setError('Please log in with email and password first to set up biometric authentication')
        return
      }

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            id: base64urlDecode(existingCredential.credential_id),
            type: 'public-key'
          }],
          userVerification: 'required'
        }
      }) as PublicKeyCredential

      if (credential) {
        // Verify the credential on the server-side
        const { error } = await supabase.functions.invoke('verify-biometric', {
          body: { credential: credential.id }
        })

        if (error) {
          setError('Biometric authentication failed')
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error) {
      setError('Biometric authentication failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg">
        <h3 className="text-2xl font-bold text-center">Login to your account</h3>
        <form onSubmit={handleLogin}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="email">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="password">Password</label>
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900" type="submit">Login</button>
              <button className="px-6 py-2 mt-4 text-white bg-green-600 rounded-lg hover:bg-green-900" type="button" onClick={handleBiometricLogin}>Biometric Login</button>
            </div>
          </div>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  )
}

function base64urlDecode(str: string) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
}

