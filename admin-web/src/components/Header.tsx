/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Bell, Search, Clock, ChevronDown, CheckCircle } from "lucide-react";

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
        {/* Realtime clock widget */}
        <div className="hidden md:flex items-center gap-2 bg-[#8c7623]/5 border border-[#8c7623]/10 px-4 py-1.5 rounded-full">
          <Clock className="h-3.5 w-3.5 text-[#8c7623] animate-pulse" />
          <span className="font-mono text-[9px] font-bold text-[#8c7623] tracking-widest uppercase">
            HÔM NAY • {time || "00:00:00"}
          </span>
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
              setUnreadCount(0); // clear count
            }}
            className="p-2.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 rounded-xl transition-all relative border border-transparent hover:border-zinc-200/50"
            title="Thông báo hệ thống"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-600 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2 z-30 ring-1 ring-black/5 animate-fade-in p-1">
              <div className="px-4 py-2.5 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 font-sans">
                  Thông báo hệ thống (3)
                </span>
                <span className="text-[10px] text-[#8c7623] font-bold font-sans cursor-pointer hover:underline uppercase tracking-wider">
                  Đã xem tất cả
                </span>
              </div>
              <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3 hover:bg-zinc-50/80 rounded-xl transition-colors cursor-pointer text-left my-0.5 mx-1">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${
                        notif.type === 'warning' ? 'bg-amber-500' : notif.type === 'user' ? 'bg-sky-500' : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-zinc-800 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.desc}
                        </p>
                        <span className="text-[8px] text-zinc-400 font-mono mt-1 block">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Separator line */}
        <div className="h-6 w-[1px] bg-zinc-200/80" />

        {/* Administrator Profile Widget */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 hover:bg-zinc-50 border border-transparent hover:border-zinc-200/50 p-1.5 rounded-xl transition-all text-left"
          >
            <div className="w-8.5 h-8.5 rounded-full ring-2 ring-[#8c7623]/20 overflow-hidden bg-zinc-150">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLyYNw3fZLxaU8gUy42DXjF5L0FvxXtpY4EMltpaJQBD_h1BMfIYST6LeBGrVEU_vzJnldoBCQR6zDVcbs7tHKnRfcCJzkup5ae2CDAfXTWRoiNOCbErrpbQ8_s7vhj5mCseoFLAZw1YJuIt8x02N9BeyGazR7j3NGfMToOKEE6Tf2HgslO7txs-VG3PfueEc7anU7sXT3N6FGGHyigLIm9CMqZ67MmXlBg-q-EOFwFZAmGHfFvG19lnneG1poT4S-7FEfN-nqVrQ" 
                alt="Admin Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-[9px] text-[#8c7623] font-bold uppercase tracking-widest">
                Owner Role
              </p>
              <p className="font-sans text-xs font-bold text-zinc-800 -mt-0.5 whitespace-nowrap">
                Marie Laurent
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-zinc-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-60 bg-white border border-zinc-100 rounded-2xl shadow-xl py-2.5 z-30 ring-1 ring-black/5 animate-fade-in p-1">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">Đăng nhập với tư cách</p>
                <p className="text-[11px] font-bold text-zinc-800 font-sans truncate">{auth.currentUser?.email || "marie.laurent@trendify.com"}</p>
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
