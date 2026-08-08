/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActiveTab } from "../types";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Tag, 
  FolderGit2, 
  Globe,
  LogOut,
  Ticket,
  Bell,
  Image as ImageIcon
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  productCount: number;
  orderCount: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  productCount,
  orderCount,
  onLogout
}) => {
  const menuItems = [
    {
      id: ActiveTab.DASHBOARD,
      label: "Tổng quan",
      icon: LayoutDashboard,
      badge: null,
      description: "Dashboard"
    },
    {
      id: ActiveTab.ORDERS,
      label: "Đơn hàng",
      icon: ShoppingBag,
      badge: orderCount > 0 ? orderCount.toString() : "46",
      description: "Quản lý đơn hàng"
    },
    {
      id: ActiveTab.PRODUCTS,
      label: "Sản phẩm",
      icon: Tag,
      badge: "128",
      description: "Quản lý sản phẩm"
    },
    {
      id: ActiveTab.CATEGORIES,
      label: "Danh mục",
      icon: FolderGit2,
      badge: "18",
      description: "Quản lý danh mục"
    },
    {
      id: ActiveTab.VOUCHERS,
      label: "Voucher",
      icon: Ticket,
      badge: null,
      description: "Mã giảm giá & KM"
    },
    {
      id: ActiveTab.USERS,
      label: "Khách hàng",
      icon: Users,
      badge: "352",
      description: "Quản lý khách hàng"
    },
    {
      id: "vouchers", // Mocked for UI match
      label: "Khuyến mãi",
      icon: Tag,
      badge: "12",
      description: "Mã giảm giá"
    },
    {
      id: "inventory", // Mocked for UI match
      label: "Kho hàng",
      icon: ShoppingBag,
      badge: null,
<<<<<<< HEAD
      description: "Quản lý kho"
    },
    {
      id: ActiveTab.REPORTS,
      label: "Báo cáo",
      icon: LayoutDashboard,
      badge: null,
      description: "Thống kê & Báo cáo"
    },
    {
      id: ActiveTab.SETTINGS,
      label: "Cài đặt",
      icon: Globe,
      badge: null,
      description: "Thiết lập hệ thống"
=======
      description: "Hội viên & Giao dịch"
    },
    {
      id: ActiveTab.NOTIFICATIONS,
      label: "Thông báo",
      icon: Bell,
      badge: null,
      description: "Gửi thông báo đến App"
    },
    {
      id: ActiveTab.BANNERS,
      label: "Banner QC",
      icon: ImageIcon,
      badge: null,
      description: "Quản lý ảnh quảng cáo"
>>>>>>> origin/main
    }
  ];

  return (
<<<<<<< HEAD
    <aside className="w-[260px] bg-[#111827] h-screen sticky top-0 flex flex-col z-20 overflow-y-auto font-sans">
      {/* Branding Header */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c5e06] to-[#8d7c08] flex items-center justify-center shadow-lg shadow-[#6c5e06]/20">
             <span className="text-white font-serif text-2xl font-bold">T</span>
          </div>
          <div>
            <h1 className="font-serif text-[24px] tracking-tight text-white font-bold leading-none">
              Trendify
            </h1>
            <p className="font-sans text-[10px] tracking-[0.2em] text-[#6c5e06] uppercase mt-1 font-bold">
              ADMIN PANEL
            </p>
          </div>
        </div>
=======
    <aside className="w-72 bg-white border-r border-zinc-200/60 h-screen sticky top-0 flex flex-col z-20 overflow-y-auto font-sans">
      {/* Branding Header */}
      <div className="p-8 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#8c7623] animate-pulse"></span>
          <span className="font-mono text-[9px] tracking-[0.25em] text-[#8c7623] uppercase font-bold">
            Boutique Portal
          </span>
        </div>
        <h1 className="font-serif text-3xl tracking-tight text-zinc-900 mt-2 font-medium">
          Trendify
        </h1>
        <p className="font-sans text-[10px] tracking-[0.15em] text-zinc-400 uppercase mt-0.5 font-medium">
          Luxury Administration
        </p>
>>>>>>> origin/main
      </div>

      <div className="h-[1px] w-full bg-neutral-800/50 mb-4 px-6 mx-auto max-w-[220px]"></div>

      {/* Navigation Space */}
<<<<<<< HEAD
      <nav className="flex-1 px-4 py-2 space-y-1">
=======
      <nav className="flex-1 px-4 py-8 space-y-1.5">
>>>>>>> origin/main
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
<<<<<<< HEAD
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full group flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                isActive 
                  ? "bg-[#6c5e06] text-white shadow-lg shadow-[#6c5e06]/10"
                  : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
              }`}
            >
              <IconComponent
                className={`h-5 w-5 mt-0.5 ${
                  isActive ? "text-white" : "text-[#6B7280] group-hover:text-white"
=======
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-start gap-4 p-3.5 rounded-xl text-left transition-all duration-300 relative ${
                isActive 
                  ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/10" 
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              }`}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-3.5 bottom-3.5 w-1 bg-[#8c7623] rounded-r-full" />
              )}
              
              <IconComponent 
                className={`h-5 w-5 mt-0.5 transition-transform duration-300 ${
                  isActive ? "text-[#8c7623] scale-110" : "text-zinc-400 group-hover:scale-105"
>>>>>>> origin/main
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
<<<<<<< HEAD
                  <span className={`text-[13px] font-semibold tracking-tight font-sans ${
                    isActive ? "text-white" : "text-[#F9FAFB]"
=======
                  <span className={`text-[11px] font-bold tracking-wider font-sans uppercase ${
                    isActive ? "text-white" : "text-zinc-800"
>>>>>>> origin/main
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
<<<<<<< HEAD
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-sans ${
                      isActive 
                        ? "bg-white/20 text-white"
                        : "bg-neutral-800 text-neutral-400"
=======
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? "bg-[#8c7623] text-white" 
                        : "bg-zinc-100 text-zinc-650"
>>>>>>> origin/main
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
<<<<<<< HEAD
                <p className={`text-[10px] font-medium font-sans mt-0.5 leading-none ${
                  isActive ? "text-white/70" : "text-[#6B7280]"
=======
                <p className={`text-[10px] font-sans mt-0.5 leading-normal ${
                  isActive ? "text-zinc-400" : "text-zinc-450"
>>>>>>> origin/main
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Meta */}
<<<<<<< HEAD
      <div className="p-4 bg-black/20 border-t border-white/5">
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[11px] font-bold text-neutral-300">Thu gọn</span>
          </div>
          
          <button
            onClick={() => {}} // Collapse logic omitted for now
            className="p-1.5 hover:bg-white/10 text-neutral-400 rounded-lg transition-colors"
          >
             <LayoutDashboard className="h-4 w-4 rotate-90" />
          </button>
        </div>
=======
      <div className="p-6 border-t border-zinc-100 bg-zinc-50/50">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors border border-rose-100"
            title="Đăng xuất khỏi hệ thống"
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-wider font-sans">Đăng xuất</span>
          </button>
        )}
>>>>>>> origin/main
      </div>
    </aside>
  );
};
