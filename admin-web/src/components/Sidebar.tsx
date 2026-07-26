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
  LogOut
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
      description: "Doanh thu & Thống kê"
    },
    {
      id: ActiveTab.ORDERS,
      label: "Đơn hàng",
      icon: ShoppingBag,
      badge: orderCount > 0 ? orderCount.toString() : null,
      description: "Chi tiết & Giao nhận"
    },
    {
      id: ActiveTab.PRODUCTS,
      label: "Sản phẩm",
      icon: Tag,
      badge: productCount.toString(),
      description: "Quản lý tồn kho"
    },
    {
      id: ActiveTab.CATEGORIES,
      label: "Danh mục",
      icon: FolderGit2,
      badge: null,
      description: "Phân loại bộ sưu tập"
    },
    {
      id: ActiveTab.USERS,
      label: "Khách hàng",
      icon: Users,
      badge: null,
      description: "Hội viên & Giao dịch"
    }
  ];

  return (
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
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-4 py-8 space-y-1.5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
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
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold tracking-wider font-sans uppercase ${
                    isActive ? "text-white" : "text-zinc-800"
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? "bg-[#8c7623] text-white" 
                        : "bg-zinc-100 text-zinc-650"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-[10px] font-sans mt-0.5 leading-normal ${
                  isActive ? "text-zinc-400" : "text-zinc-450"
                }`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Meta */}
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
      </div>
    </aside>
  );
};
