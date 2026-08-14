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
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-8 flex items-center justify-between sticky top-0 z-30 font-sans shadow-xs">
      {/* Search Input bar */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-4 w-4 text-zinc-400" />
        </span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Tìm sản phẩm, đơn hàng..."
          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-8 py-1.5 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
        />
        {searchText && (
          <button 
            onClick={() => setSearchText("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-zinc-400 hover:text-zinc-700"
          >
            Xóa
          </button>
        )}
      </div>

      {/* Utilities Container */}
      <div className="flex items-center gap-4">
        {/* Administrator Profile Widget */}
        <div className="relative">
          <button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors border border-zinc-200"
          >
            <div className="w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-zinc-900 leading-tight">
                Quản trị viên
              </p>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {auth.currentUser?.email || "admin@trendify.vn"}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-30 text-sm">
              <div className="px-4 py-2 border-b border-zinc-100">
                <p className="text-xs text-zinc-500 font-medium">Tài khoản</p>
                <p className="text-sm font-semibold text-zinc-900 truncate">{auth.currentUser?.email || "admin@trendify.vn"}</p>
              </div>
              <div className="pt-1">
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-700 bg-emerald-50">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Hệ thống hoạt động bình thường</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

