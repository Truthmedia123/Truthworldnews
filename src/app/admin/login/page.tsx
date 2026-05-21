'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white p-8 max-w-md w-full border-4 border-[#FFFF00] shadow-[8px_8px_0px_0px_rgba(255,255,0,1)]">
        <h1 className="text-4xl font-inter font-black uppercase text-black mb-6 text-center">
          Admin <span className="text-red-600">Access</span>
        </h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 mb-6 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block font-inter font-bold uppercase text-sm mb-2 text-black">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-2 border-black p-3 font-serif focus:outline-none focus:border-[#FFFF00] focus:ring-2 focus:ring-[#FFFF00] text-black"
              required
            />
          </div>
          <div>
            <label className="block font-inter font-bold uppercase text-sm mb-2 text-black">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-black p-3 font-serif focus:outline-none focus:border-[#FFFF00] focus:ring-2 focus:ring-[#FFFF00] text-black"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-[#FFFF00] font-inter font-black uppercase py-4 border-2 border-black hover:bg-[#FFFF00] hover:text-black transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter Mainframe'}
          </button>
        </form>
      </div>
    </div>
  );
}
