/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Bell, Search, Clock, ChevronDown, CheckCircle, User } from "lucide-react";
import { auth } from "../firebase";

interface HeaderProps {
  searchText: string;
  setSearchText: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchText, setSearchText }) => {
  const [time, setTime] = useState<string>("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const notifications = [
    {
      id: 1,
      title: "Đơn hàng mới #TRD-90124",
      desc: "Nguyễn Minh Tú vừa thanh toán 16.850.000 ₫",
      time: "5 phút trước",
      type: "order"
    },
    {
      id: 2,
      title: "Cảnh báo hết hàng trong kho",
      desc: '"Nocturne Tote Bag" đã giảm xuống dưới mức tối thiểu (còn 4 chiếc)',
      time: "1 giờ trước",
      type: "warning"
    },
    {
      id: 3,
      title: "Cập nhật tài khoản hội viên",
      desc: "Khách hàng Lê Minh Anh được nâng cấp hạng GOLD",
      time: "3 giờ trước",
      type: "user"
    }
  ];

  // Tick the clock nicely
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-8 flex items-center justify-between sticky top-0 z-30 font-sans">
      {/* Search Input bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
          className="w-full bg-zinc-50 border border-zinc-200/80 rounded-xl pl-10 pr-4 py-2 text-xs font-sans text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-[#8c7623] focus:bg-white focus:ring-4 focus:ring-[#8c7623]/10 transition-all duration-250"
        />
        {searchText && (
          <button 
            onClick={() => setSearchText("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] text-zinc-400 hover:text-zinc-650 font-sans font-bold uppercase tracking-wider"
          >
            Hủy lọc
          </button>
        )}
      </div>

      {/* Utilities Container */}
      <div className="flex items-center gap-6">
        {/* Administrator Profile Widget */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/50 p-1.5 rounded-xl transition-all text-left"
          >
            <div className="w-8.5 h-8.5 rounded-full ring-2 ring-[#8c7623]/20 flex items-center justify-center bg-zinc-50 text-[#8c7623] shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-[9px] text-[#8c7623] font-bold uppercase tracking-widest">
                Owner Role
              </p>
              <p className="font-sans text-xs font-bold text-zinc-800 -mt-0.5 whitespace-nowrap">
                Trendify
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2.5 z-30 ring-1 ring-black/5 animate-fade-in p-1">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Đăng nhập với tư cách</p>
                <p className="text-[11px] font-bold text-zinc-800 font-sans truncate">{auth.currentUser?.email || "admin@trendify.com"}</p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl cursor-pointer mx-1">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Xác thực bảo mật: Bật</span>
                </div>
                <div className="px-4 py-2 text-[10px] text-zinc-400 font-sans leading-relaxed">
                  Hệ thống bảo vệ đa lớp Cloud Run hoạt động bình thường.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
