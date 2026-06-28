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
  Globe
} from "lucide-react";

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  productCount: number;
  orderCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  productCount,
  orderCount
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
    <aside className="w-72 bg-white border-r border-[#cfc4c5]/40 h-screen sticky top-0 flex flex-col z-20 overflow-y-auto">
      {/* Branding Header */}
      <div className="p-8 border-b border-[#cfc4c5]/30">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#6c5e06] animate-pulse"></span>
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#6c5e06] uppercase font-semibold">
            Boutique Portal
          </span>
        </div>
        <h1 className="font-serif text-3xl tracking-tight text-[#1b1c1c] mt-2 font-medium">
          Trendify
        </h1>
        <p className="font-sans text-[11px] tracking-[0.1em] text-neutral-400 uppercase mt-0.5">
          Luxury Administration
        </p>
      </div>

      {/* Navigation Space */}
      <nav className="flex-1 px-4 py-8 space-y-1">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full group flex items-start gap-4 p-3.5 rounded-lg text-left transition-all duration-300 relative ${
                isActive 
                  ? "bg-[#6c5e06]/5 text-[#6c5e06]" 
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
              }`}
            >
              {/* Highlight bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#6c5e06] rounded-r-full" />
              )}
              
              <IconComponent 
                className={`h-5 w-5 mt-0.5 transition-transform duration-300 ${
                  isActive ? "text-[#6c5e06] scale-110" : "text-neutral-400 group-hover:scale-105"
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold tracking-wider font-sans uppercase ${
                    isActive ? "text-[#1b1c1c]" : "text-neutral-700 font-medium"
                  }`}>
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? "bg-[#6c5e06] text-white" 
                        : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-neutral-400 font-normal font-sans mt-0.5 leading-normal">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer System Meta */}
      <div className="p-6 border-t border-[#cfc4c5]/30 bg-[#fbf9f9]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border border-[#cfc4c5]/30">
            <Globe className="h-4 w-4 text-[#6c5e06]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <p className="font-sans text-[10px] font-bold text-neutral-700 uppercase tracking-widest">
                Production Live
              </p>
            </div>
            <p className="font-mono text-[9px] text-neutral-400">
              v1.0.4 • TLS Secured
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
