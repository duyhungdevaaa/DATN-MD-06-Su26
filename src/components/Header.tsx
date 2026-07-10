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
    <header className="h-20 bg-white border-b border-[#cfc4c5]/40 px-8 flex items-center justify-between sticky top-0 z-10">
      {/* Search Input bar */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-neutral-400" />
        </span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
          className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2 text-xs font-sans focus:outline-none focus:border-[#6c5e06] focus:bg-white transition-colors duration-200"
        />
        {searchText && (
          <button 
            onClick={() => setSearchText("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] text-neutral-400 hover:text-neutral-600 font-sans font-medium"
          >
            Hủy lọc
          </button>
        )}
      </div>

      {/* Utilities Container */}
      <div className="flex items-center gap-6">
        {/* Realtime clock widget */}
        <div className="hidden md:flex items-center gap-2 bg-[#6c5e06]/5 border border-[#6c5e06]/20 px-3 py-1.5 rounded-lg">
          <Clock className="h-3.5 w-3.5 text-[#6c5e06] animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-[#6c5e06] tracking-widest uppercase">
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
            className="p-2 text-neutral-500 hover:bg-neutral-100 rounded-full transition-colors relative"
            title="Thông báo hệ thống"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-[#cfc4c5]/50 rounded-lg shadow-xl py-2 z-30">
              <div className="px-4 py-2 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1b1c1c] font-sans">
                  Thông báo hệ thống (3)
                </span>
                <span className="text-[10px] text-[#6c5e06] font-medium font-sans cursor-pointer hover:underline">
                  Đánh dấu đã đọc
                </span>
              </div>
              <div className="divide-y divide-neutral-50 max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className="p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-left">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${
                        notif.type === 'warning' ? 'bg-amber-500' : notif.type === 'user' ? 'bg-sky-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-neutral-900 leading-tight">
                          {notif.title}
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.desc}
                        </p>
                        <span className="text-[9px] text-neutral-400 font-mono mt-1 block">
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
        <div className="h-6 w-[1px] bg-[#cfc4c5]/40" />

        {/* Administrator Profile Widget */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 hover:bg-neutral-50 p-1.5 rounded-lg transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full ring-2 ring-[#cfc4c5]/30 overflow-hidden bg-neutral-100">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLyYNw3fZLxaU8gUy42DXjF5L0FvxXtpY4EMltpaJQBD_h1BMfIYST6LeBGrVEU_vzJnldoBCQR6zDVcbs7tHKnRfcCJzkup5ae2CDAfXTWRoiNOCbErrpbQ8_s7vhj5mCseoFLAZw1YJuIt8x02N9BeyGazR7j3NGfMToOKEE6Tf2HgslO7txs-VG3PfueEc7anU7sXT3N6FGGHyigLIm9CMqZ67MmXlBg-q-EOFwFZAmGHfFvG19lnneG1poT4S-7FEfN-nqVrQ" 
                alt="Admin Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="hidden sm:block">
              <p className="font-mono text-[10px] text-[#6c5e06] font-bold uppercase tracking-widest">
                Owner Role
              </p>
              <p className="font-sans text-xs font-semibold text-neutral-800 -mt-0.5 whitespace-nowrap">
                Marie Laurent
              </p>
            </div>
            <ChevronDown className="h-3 w-3 text-neutral-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-[#cfc4c5]/50 rounded-lg shadow-xl py-2.5 z-30">
              <div className="px-4 py-2 border-b border-neutral-100">
                <p className="text-[10px] text-neutral-400 font-mono">Đăng nhập với tư cách</p>
                <p className="text-xs font-semibold text-[#1b1c1c] font-sans">marie.laurent@trendify.com</p>
              </div>
              <div className="py-1">
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-50 cursor-pointer">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span>Xác thực vân tay: Bật</span>
                </div>
                <div className="px-4 py-2 text-xs text-neutral-400 font-sans">
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
