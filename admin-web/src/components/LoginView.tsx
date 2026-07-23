import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Sparkles, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setErrorMsg('Đăng nhập thất bại: ' + (error.message || 'Sai email hoặc mật khẩu.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-3xl border border-zinc-200/60 shadow-xl max-w-md w-full mx-4 ring-1 ring-black/5">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#8c7623]" />
            <span className="font-mono text-[9px] tracking-[0.25em] text-[#8c7623] uppercase font-bold">
              Hệ Thống Quản Trị
            </span>
          </div>
          <h2 className="font-serif text-3xl text-zinc-950 font-bold">Trendify Admin</h2>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Vui lòng đăng nhập để truy cập cơ sở dữ liệu Firebase.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 text-left">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
              Email Quản trị viên
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800 font-medium"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-sans">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all text-zinc-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-all hover:bg-[#8c7623] disabled:opacity-50 shadow-md shadow-zinc-900/5 cursor-pointer mt-2"
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
};
