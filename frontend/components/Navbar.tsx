'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white font-black italic">V</div>
          <span className="text-xl font-black tracking-tighter">V-Wardrobe</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-black">{user?.fullName || 'User'}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
