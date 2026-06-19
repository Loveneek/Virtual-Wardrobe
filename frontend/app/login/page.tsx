'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* We use bg-slate-50 as a fallback to ensure it's never pure white */
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 overflow-hidden">

      {/* Background Blobs - Increased opacity and size to be visible */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-300/30 blur-[100px]"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 bg-white/40 backdrop-blur-3xl p-10 rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.15)] w-full max-w-md border border-white/50">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-3xl mb-6 shadow-xl">
            <span className="text-2xl font-black text-white italic">V</span>
          </div>
          <h1 className="text-4xl font-black text-black tracking-tighter">V-Wardrobe</h1>
          <p className="text-gray-600 font-medium mt-1">AI-Powered Virtual Fitting</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100/80 border border-red-200 text-red-700 rounded-xl text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-4 bg-white/60 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none text-black"
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 bg-white/60 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-black focus:bg-white transition-all outline-none text-black"
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4.5 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Entering...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="text-black font-bold hover:underline transition-all">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
