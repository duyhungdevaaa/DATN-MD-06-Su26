/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Bell, Search, Clock, ChevronDown, CircleCheck, LayoutDashboard } from "lucide-react";

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
    <header className="h-14 bg-white border-b border-[#E5E7EB] px-8 flex items-center justify-between sticky top-0 z-10 font-sans">

      <div className="flex items-center gap-8 flex-1">
        {/* Menu toggle for small screens */}
        <button className="md:hidden p-2 text-neutral-400 hover:bg-neutral-50 rounded-lg">
          <LayoutDashboard className="h-5 w-5" />
        </button>

        {/* Search Input bar matching specs */}
        <div className="relative w-full max-w-[400px]">
          <span className="absolute inset-y-0 left-[12px] flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[#9CA3AF]" />
          </span>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tìm kiếm..."
            className="w-full h-[34px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-[36px] pr-[60px] text-[13px] font-medium text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6c5e06]/15 focus:border-[#6c5e06] focus:bg-white transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-[10px] flex items-center gap-1">
            <span className="px-1 py-0.5 border border-[#E5E7EB] rounded text-[9px] font-bold text-[#9CA3AF] bg-white">Ctrl</span>
            <span className="text-[9px] font-bold text-[#9CA3AF]">K</span>
          </div>
        </div>
      </div>

      {/* Utilities Container */}
      <div className="flex items-center gap-4 ml-4">
        {/* Realtime clock widget */}
        <div className="hidden lg:flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-1 rounded-[8px]">
          <Clock className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-[12px] font-semibold text-[#6B7280]">
            {time || "00:00:00"}
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
            className="p-2 text-neutral-500 hover:bg-neutral-100 border border-[#E5E7EB] rounded-[8px] transition-all relative shadow-sm"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="h-6 w-[1px] bg-[#E5E7EB]" />

        {/* Administrator Profile Widget */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 hover:bg-neutral-50 p-1 rounded-lg transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full border border-[#E5E7EB] overflow-hidden bg-neutral-100">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop"
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-[12px] font-bold text-[#111827] leading-none">
                Marie Laurent
              </p>
              <p className="text-[10px] font-medium text-[#6B7280] mt-0.5">
                Quản trị viên
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </button>
        </div>
      </div>
    </header>
  );
};
