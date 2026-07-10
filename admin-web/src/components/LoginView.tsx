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
    <div className="min-h-screen bg-[#fbf9f9] flex items-center justify-center font-sans">
      <div className="bg-white p-10 rounded-2xl border border-[#cfc4c5]/40 custom-shadow max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-[#6c5e06]" />
            <span className="font-mono text-[10px] tracking-[0.25em] text-[#6c5e06] uppercase font-bold">
              Hệ Thống Quản Trị
            </span>
          </div>
          <h2 className="font-serif text-3xl text-[#1b1c1c] font-light">Trendify Admin</h2>
          <p className="text-xs text-neutral-500 mt-2">Vui lòng đăng nhập để truy cập cơ sở dữ liệu Firebase.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
              Email Quản trị viên
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1.5">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#fbf9f9] border border-neutral-200 rounded-lg p-3 text-xs focus:outline-none focus:border-[#6c5e06] focus:bg-white text-neutral-800"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1b1c1c] text-white py-3.5 rounded-lg text-xs font-semibold tracking-wider uppercase transition-colors hover:bg-[#6c5e06] disabled:opacity-50"
          >
            {isLoading ? 'Đang xác thực...' : 'Đăng nhập vào hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
};
