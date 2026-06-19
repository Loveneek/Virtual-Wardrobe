import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-slate-50 overflow-hidden">

      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-400/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-400/20 blur-[120px]"></div>
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-indigo-300/30 blur-[100px]"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-black rounded-[2rem] mb-10 shadow-2xl transform hover:scale-105 transition-all duration-300">
          <span className="text-4xl font-black text-white italic">V</span>
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-black tracking-tighter mb-6 leading-tight">
          Your Digital <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Wardrobe</span>
        </h1>

        <p className="text-xl text-gray-600 font-medium mb-12 max-w-lg mx-auto leading-relaxed">
          AI-powered virtual fitting room. Organize your clothes, try on new outfits, and discover your perfect style.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            Create Account
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-10 py-5 bg-white text-black border-2 border-gray-200 rounded-2xl font-bold text-lg hover:border-black hover:bg-gray-50 transition-all duration-300 active:scale-95"
          >
            Sign In
          </Link>
        </div>
      </div>

    </div>
  );
}
