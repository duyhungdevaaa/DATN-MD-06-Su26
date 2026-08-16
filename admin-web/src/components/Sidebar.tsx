/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ActiveTab } from "../types";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  RotateCcw,
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
  returnCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  productCount,
  orderCount,
  returnCount = 0,
  onLogout
}) => {
  const menuItems = [
    {
      id: ActiveTab.DASHBOARD,
      label: "Tổng quan",
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: ActiveTab.ORDERS,
      label: "Đơn hàng",
      icon: ShoppingBag,
      badge: orderCount > 0 ? orderCount.toString() : null
    },
    {
      id: ActiveTab.RETURNS,
      label: "Đổi trả & Hàng hoàn",
      icon: RotateCcw,
      badge: returnCount > 0 ? returnCount.toString() : null,
      badgeColor: "rose"
    },
    {
      id: ActiveTab.PRODUCTS,
      label: "Sản phẩm",
      icon: Tag,
      badge: productCount > 0 ? productCount.toString() : null
    },
    {
      id: ActiveTab.CATEGORIES,
      label: "Danh mục",
      icon: FolderGit2,
      badge: null
    },
    {
      id: ActiveTab.VOUCHERS,
      label: "Mã giảm giá",
      icon: Ticket,
      badge: null
    },
    {
      id: ActiveTab.USERS,
      label: "Khách hàng",
      icon: Users,
      badge: null
    },
    {
      id: ActiveTab.NOTIFICATIONS,
      label: "Thông báo",
      icon: Bell,
      badge: null
    },
    {
      id: ActiveTab.BANNERS,
      label: "Banner quảng cáo",
      icon: ImageIcon,
      badge: null
    }
  ];

  return (
    <aside className="w-52 bg-white border-r border-zinc-200 h-screen sticky top-0 flex flex-col z-20 overflow-y-auto font-sans shrink-0">
      {/* Branding Header */}
      <div className="p-4 border-b border-zinc-100 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
          T
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold text-zinc-900 leading-tight truncate">
            Trendify Admin
          </h1>
          <p className="text-[11px] text-zinc-500 font-medium truncate">
            Quản lý hệ thống
          </p>
        </div>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <p className="px-2.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
          Danh mục
        </p>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive 
                  ? "bg-zinc-900 text-white shadow-xs" 
                  : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent 
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? "text-amber-400" : "text-zinc-400"
                  }`} 
                />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                  isActive 
                    ? "bg-amber-400 text-zinc-950" 
                    : item.id === ActiveTab.RETURNS 
                      ? "bg-rose-100 text-rose-700 border border-rose-200" 
                      : "bg-zinc-100 text-zinc-700"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-2.5 py-1.5 bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 rounded-lg transition-colors border border-zinc-200 text-xs font-semibold shadow-xs"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>
    </aside>
  );
};


