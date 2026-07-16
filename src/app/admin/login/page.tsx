'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      router.push('/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-black flex items-center justify-center p-8">
      <form onSubmit={handleSubmit} className="w-full max-w-sm border-4 border-black p-6 bg-white">
        <h1 className="text-2xl font-black uppercase mb-6 text-red-600">Admin Login</h1>

        {error && <div className="bg-red-100 border-2 border-red-600 p-2 mb-4 text-sm">{error}</div>}

        <label className="block mb-4">
          <span className="text-xs font-black uppercase">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="block w-full mt-1 border-2 border-black p-2"
          />
        </label>

        <label className="block mb-6">
          <span className="text-xs font-black uppercase">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="block w-full mt-1 border-2 border-black p-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#FFFF00] border-2 border-black p-3 font-black uppercase disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
