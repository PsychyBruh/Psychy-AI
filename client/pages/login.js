import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function Login({ toggleTheme }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', { email, password })
      localStorage.setItem('emerald_token', res.data.token)
      router.push('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <>
      <Navbar toggleTheme={toggleTheme} user={null} />
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded shadow">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-700"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{' '}
          <a
            onClick={() => router.push('/register')}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Register
          </a>
        </p>
      </div>
    </>
  )
}
